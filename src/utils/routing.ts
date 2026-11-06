// src/utils/routing.ts
// ──────────────────────────────────────────────────────────────
// Módulo de roteamento do CampusGO
//
// Implementa Dijkstra com filtragem de acessibilidade:
//   • Se isAccessibleOnly = true, arestas com type "stairs"
//     são desconsideradas (prioriza elevadores e rampas).
//   • Grafo bidirecional (cada edge vale nos dois sentidos).
//   • Retorna path (nós ordenados) + distância total.
// ──────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// TIPOS PÚBLICOS
// ═══════════════════════════════════════════════════════════════

/** Tipo de conexão física entre dois nós */
export type EdgeType =
  | "corridor"   // Corredor / caminho padrão
  | "stairs"     // Escada (bloqueada em modo acessível)
  | "elevator"   // Elevador (sempre acessível)
  | "ramp"       // Rampa (sempre acessível)
  | "outdoor"    // Caminho externo
  | "bridge";    // Passarela / ponte entre blocos

/** Nó do grafo — representa um ponto físico no mapa */
export interface FloorNode {
  /** Identificador único (ex: "n0", "sA1", "x3") */
  id: string;
  /** Nome legível. Nós auxiliares (waypoints) não possuem name */
  name?: string;
  /** Coordenada X no SVG do mapa */
  x: number;
  /** Coordenada Y no SVG do mapa */
  y: number;
  /** Andar do campus (0 = térreo, 1 = 1° andar, etc.) */
  floor?: number;
}

/** Aresta do grafo — conexão entre dois nós */
export interface FloorEdge {
  /** ID do nó de origem */
  from: string;
  /** ID do nó de destino */
  to: string;
  /** Peso / custo da aresta (distância em unidades do mapa) */
  w: number;
  /**
   * Tipo da conexão física.
   * Se omitido, assume "corridor".
   * Quando isAccessibleOnly = true, edges com type "stairs"
   * são excluídas do grafo.
   */
  type?: EdgeType;
}

/** Estrutura completa do grafo de um andar / campus */
export interface FloorGraph {
  /** Mapa de nós indexado por id */
  nodes: Record<string, FloorNode>;
  /** Lista de arestas (bidirecional implícito) */
  edges: FloorEdge[];
}

/** Resultado do cálculo de rota */
export interface RouteResult {
  /** true se um caminho foi encontrado */
  found: boolean;
  /** Lista ordenada de nós do caminho (origem → destino) */
  path: FloorNode[];
  /** Distância total ponderada do caminho */
  totalDistance: number;
  /** Quantas arestas "stairs" foram filtradas (informativo) */
  stairsFiltered: number;
}

// ═══════════════════════════════════════════════════════════════
// IMPLEMENTAÇÃO — MIN-HEAP (Priority Queue)
// ═══════════════════════════════════════════════════════════════

/**
 * Min-heap binário simples para a fila de prioridade do Dijkstra.
 * Usa um array flat com comparação por distância.
 */
interface HeapEntry {
  nodeId: string;
  dist: number;
}

class MinHeap {
  private heap: HeapEntry[] = [];

  get size(): number {
    return this.heap.length;
  }

  push(entry: HeapEntry): void {
    this.heap.push(entry);
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): HeapEntry | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[i].dist < this.heap[parent].dist) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else {
        break;
      }
    }
  }

  private _sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && this.heap[left].dist < this.heap[smallest].dist) {
        smallest = left;
      }
      if (right < n && this.heap[right].dist < this.heap[smallest].dist) {
        smallest = right;
      }
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else {
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ADJACENCY LIST BUILDER
// ═══════════════════════════════════════════════════════════════

interface AdjEntry {
  neighborId: string;
  weight: number;
}

/**
 * Constrói a lista de adjacência bidirecional a partir das edges,
 * filtrando as arestas de escada quando necessário.
 *
 * @returns [adjacencyMap, stairsFilteredCount]
 */
function buildAdjacencyList(
  edges: FloorEdge[],
  isAccessibleOnly: boolean
): [Map<string, AdjEntry[]>, number] {
  const adj = new Map<string, AdjEntry[]>();
  let stairsFiltered = 0;

  // Helper para garantir que o array de vizinhos exista
  const ensure = (id: string): AdjEntry[] => {
    if (!adj.has(id)) adj.set(id, []);
    return adj.get(id)!;
  };

  // Deduplicação: o mockData.js tem arestas duplicadas
  // (mesma from→to aparece em múltiplas "rotas").
  // Usamos um Set para ignorar duplicatas.
  const seen = new Set<string>();

  for (const edge of edges) {
    const edgeType: EdgeType = edge.type ?? "corridor";

    // Filtro de acessibilidade: remove escadas
    if (isAccessibleOnly && edgeType === "stairs") {
      stairsFiltered++;
      continue;
    }

    // Chave canônica para deduplicação (ordem alfabética dos IDs)
    const canonicalKey =
      edge.from < edge.to
        ? `${edge.from}|${edge.to}`
        : `${edge.to}|${edge.from}`;

    if (seen.has(canonicalKey)) continue;
    seen.add(canonicalKey);

    // Bidirecional: adiciona nos dois sentidos
    ensure(edge.from).push({ neighborId: edge.to, weight: edge.w });
    ensure(edge.to).push({ neighborId: edge.from, weight: edge.w });
  }

  return [adj, stairsFiltered];
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL: calculateRoute
// ═══════════════════════════════════════════════════════════════

/**
 * Calcula a rota mais curta entre dois nós usando Dijkstra
 * com fila de prioridade (min-heap).
 *
 * @param originId       - ID do nó de partida (ex: "n0")
 * @param destinationId  - ID do nó de destino (ex: "n5")
 * @param isAccessibleOnly - Se true, ignora arestas do tipo "stairs"
 * @param floorGraph     - Grafo contendo nodes e edges
 * @returns RouteResult com path, distância total e status
 *
 * @example
 * ```ts
 * import { calculateRoute } from "./routing";
 * import { mapData } from "./mockData";
 *
 * // Rota padrão
 * const result = calculateRoute("n0", "n5", false, mapData);
 * console.log(result.path);          // [n0, x3, x4, n2, xBan, n5]
 * console.log(result.totalDistance);  // 1000
 *
 * // Rota acessível (sem escadas)
 * const accessible = calculateRoute("n0", "n5", true, mapData);
 * ```
 */
export function calculateRoute(
  originId: string,
  destinationId: string,
  isAccessibleOnly: boolean,
  floorGraph: FloorGraph
): RouteResult {
  const { nodes, edges } = floorGraph;

  // ── Validação de entrada ─────────────────────────────────
  if (!nodes[originId]) {
    console.warn(
      `[CampusGO Routing] Nó de origem "${originId}" não encontrado no grafo.`
    );
    return { found: false, path: [], totalDistance: 0, stairsFiltered: 0 };
  }

  if (!nodes[destinationId]) {
    console.warn(
      `[CampusGO Routing] Nó de destino "${destinationId}" não encontrado no grafo.`
    );
    return { found: false, path: [], totalDistance: 0, stairsFiltered: 0 };
  }

  if (originId === destinationId) {
    return {
      found: true,
      path: [nodes[originId]],
      totalDistance: 0,
      stairsFiltered: 0,
    };
  }

  // ── Construir lista de adjacência ────────────────────────
  const [adj, stairsFiltered] = buildAdjacencyList(edges, isAccessibleOnly);

  // ── Dijkstra com min-heap ────────────────────────────────
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  // Inicializar distâncias
  for (const nodeId of Object.keys(nodes)) {
    dist[nodeId] = Infinity;
    prev[nodeId] = null;
  }
  dist[originId] = 0;

  const heap = new MinHeap();
  heap.push({ nodeId: originId, dist: 0 });

  while (heap.size > 0) {
    const current = heap.pop()!;

    // Já visitado com distância menor? Pula
    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    // Chegou ao destino? Pode parar (Dijkstra garante ótimo)
    if (current.nodeId === destinationId) break;

    // Relaxar vizinhos
    const neighbors = adj.get(current.nodeId) ?? [];
    for (const { neighborId, weight } of neighbors) {
      if (visited.has(neighborId)) continue;

      const alt = dist[current.nodeId] + weight;
      if (alt < dist[neighborId]) {
        dist[neighborId] = alt;
        prev[neighborId] = current.nodeId;
        heap.push({ nodeId: neighborId, dist: alt });
      }
    }
  }

  // ── Reconstruir caminho ──────────────────────────────────
  if (dist[destinationId] === Infinity) {
    // Sem caminho encontrado (pode acontecer se acessibilidade
    // filtrou a única rota possível com escadas)
    console.warn(
      `[CampusGO Routing] Nenhuma rota encontrada de "${originId}" para "${destinationId}"` +
        (isAccessibleOnly ? " (modo acessível — escadas bloqueadas)." : ".")
    );
    return { found: false, path: [], totalDistance: 0, stairsFiltered };
  }

  const path: FloorNode[] = [];
  let cursor: string | null = destinationId;

  while (cursor !== null) {
    path.unshift(nodes[cursor]);
    cursor = prev[cursor];
  }

  return {
    found: true,
    path,
    totalDistance: dist[destinationId],
    stairsFiltered,
  };
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES EXPORTADAS
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica se existe pelo menos uma rota acessível entre dois nós
 * (sem usar escadas). Útil para feedback na UI.
 */
export function hasAccessibleRoute(
  originId: string,
  destinationId: string,
  floorGraph: FloorGraph
): boolean {
  const result = calculateRoute(originId, destinationId, true, floorGraph);
  return result.found;
}

/**
 * Calcula a distância euclidiana entre dois nós (reta).
 * Útil para estimativas ou comparações com a rota real.
 */
export function euclideanDistance(
  nodeA: FloorNode,
  nodeB: FloorNode
): number {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Retorna todas as arestas do tipo "stairs" do grafo.
 * Útil para debugging e para a UI mostrar onde há escadas.
 */
export function getStairsEdges(floorGraph: FloorGraph): FloorEdge[] {
  return floorGraph.edges.filter((e) => e.type === "stairs");
}

/**
 * Adapter: converte o resultado do novo calculateRoute para o
 * formato antigo (array de FloorNode[]) esperado pelos componentes
 * existentes (MapView, CampusMapViewer).
 *
 * Isso permite migração gradual — o componente MapView pode
 * continuar usando `path` como array simples enquanto internamente
 * já se beneficia do novo módulo.
 */
export function routeResultToLegacyPath(result: RouteResult): FloorNode[] {
  return result.path;
}
