// Mock data simulando o que o backend retornava

export const admins = [
  { id: 1, username: "admin", nome: "Administrador Master", senha: "admin123" },
  { id: 2, username: "prof_joao", nome: "Professor João", senha: "senha123" },
];

export const students = [
  { matricula: "1-2024233319", name: "Francisca Camilly Gomes de Oliveira" },
  { matricula: "40028922", name: "Yudi Japonês" },
  { matricula: "1-2024000001", name: "João Silva Santos" },
  { matricula: "1-2024233389", name: "Júlio Henrique de Oliveira Mendonça" },
];

export const aulas = [
  {
    id: 1,
    disciplina: "Lógica Matemática",
    horário: "08:00-09:40",
    sala: "Sala 502",
    sala_id: "sA1",
    data: "2025-10-27",
    dia_semana: "Segunda-feira",
    matriculas: ["1-2024233319", "1-2024233389", "40028922"], // <- array de alunos
  },
  {
    id: 2,
    disciplina: "Redes de Computadores",
    horário: "10:00-11:40",
    sala: "Laboratório de Informática I",
    sala_id: "sB1",
    data: "2025-10-28",
    dia_semana: "Terça-feira",
    matriculas: ["1-2024000001", "40028922", "1-2024233389"], // <- outro aluno
  },
];

export const mapData = {
  nodes: {
    // Pontos destinos visiveis
    n0: { id: "n0", name: "Você está aqui!", x: 145, y: 290 },
    n1: { id: "n1", name: "Entrada Principal", x: 60, y: 360 },
    n2: { id: "n2", name: "Elevadores", x: 173, y: 145 },
    n3: { id: "n3", name: "Banheiros", x: 300, y: 130 },
    n4: { id: "n4", name: "Salão Nobre", x: 145, y: 540 },
    n5: { id: "n5", name: "Biblioteca", x: 385, y: 145 },
    n6: { id: "x6", name: "Cantina", x: 515, y: 510 },
    n7: { id: "n7", name: "Praça de Alimentação 'A'", x: 210, y: 690 },
    n8: { id: "n8", name: "Espaço Social", x: 365, y: 580 },
    n9: { id: "n9", name: "Bloco B", x: 759, y: 360 },
    n10: { id: "n10", name: "Igreja Bom Pastor", x: 450, y: 680 },
    n11: { id: "n11", name: "Estacionamento B", x: 610, y: 750 },
    n12: { id: "n12", name: "Espaço verde", x: 1027, y: 160 },
    n13: { id: "n13", name: "Pós Unifametro", x: 855, y: 320 },
    n14: { id: "n14", name: "Banheiros", x: 1145, y: 540 },
    n15: { id: "n15", name: "Elevadores", x: 910, y: 550 },

    // Pontos Salas 'Ilusórias'
    sA1: { id: "sA1", x: 170, y: 120 },
    sB1: { id: "sB1", x: 800, y: 600 },

    //Pontos curvas invisíveis
    x0: { id: "x0", x: 145, y: 360 },
    x1: { id: "x1", x: 265, y: 360 },
    x2: { id: "x2", x: 265, y: 580 },
    xPracaAlimentacao: { id: "xPracaAlimentacao", x: 265, y: 690 }, //ponto que vai conectar diretamente a praçã de alimentação 'A'
    x3: { id: "x3", x: 145, y: 278 },
    x4: { id: "x4", x: 173, y: 278 },
    xBanheiro_Biblioteca: { id: "xBanheiro_Biblioteca", x: 300, y: 145 },
    x5: { id: "x5", x: 585, y: 360 },
    x6: { id: "x6", x: 585, y: 512 },
    x7: { id: "x7", x: 585, y: 600 },
    x8: { id: "x8", x: 605, y: 600 },
    x9: { id: "x9", x: 605, y: 785 },
    x10: { id: "x10", x: 450, y: 785 },
    x11: { id: "x11", x: 855, y: 360 },
    x12: { id: "x12", x: 865, y: 348 },
    x13: { id: "x13", x: 1064, y: 348 },
    x14: { id: "x14", x: 1064, y: 292 },
    x15: { id: "x15", x: 1136, y: 292 },
    x16: { id: "x16", x: 1136, y: 160 },
    x17: { id: "x17", x: 855, y: 280 },
    x18: { id: "x18", x: 930, y: 280 },
    x19: { id: "x19", x: 930, y: 160 },
    x20: { id: "x20", x: 855, y: 605 },
    x21: { id: "x21", x: 910, y: 605 },
    x22: { id: "x22", x: 1146, y: 605 },
  },
  edges: [
    // =======Rota para a entrada principal=======
    { from: "n0", to: "x0", w: 150 }, //Tottem -> x0
    { from: "x0", to: "n1", w: 130 }, //x0 -> Entrada Principal

    //=======Rota para o salão nobre=======
    { from: "x0", to: "n4", w: 130 }, //x0 -> Salão Nobre

    //=======Rota para o espaço social=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x2", w: 130 }, //x1 -> x2
    { from: "x2", to: "n8", w: 300 }, //x2 -> Espaço social

    //=======Rota para a Praça de alimentação=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x2", w: 130 }, //x1 -> x2
    { from: "x2", to: "xPracaAlimentacao", w: 300 }, //x2 -> xPracaAlimentacao
    { from: "xPracaAlimentacao", to: "n7", w: 300 }, //xPracaAlimentacao -> Praça de alimentação

    //=======Rota para os elevadores=======
    { from: "n0", to: "x3", w: 200 },
    { from: "x3", to: "x4", w: 200 },
    { from: "x4", to: "n2", w: 200 },

    //=======Rota para os banheiros=======
    { from: "n0", to: "x3", w: 200 },
    { from: "x3", to: "x4", w: 200 },
    { from: "x4", to: "n2", w: 200 },
    { from: "n2", to: "xBanheiro_Biblioteca", w: 200 },
    { from: "xBanheiro_Biblioteca", to: "n3", w: 200 },

    //=======Rota para a biblioteca=======
    { from: "n0", to: "x3", w: 200 },
    { from: "x3", to: "x4", w: 200 },
    { from: "x4", to: "n2", w: 200 },
    { from: "n2", to: "xBanheiro_Biblioteca", w: 200 },
    { from: "xBanheiro_Biblioteca", to: "n5", w: 200 },

    //=======Rota para o Bloco B=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x5", w: 130 }, //x0 -> x1
    { from: "x5", to: "n9", w: 130 }, //x1 -> Blobo B

    //=======Rota para Cantina=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x5", w: 130 }, //x1 -> x5
    { from: "x5", to: "x6", w: 130 }, //x5 -> x6
    { from: "x6", to: "n6", w: 130 }, //x6 -> Cantina

    //=======Rota Sala A=======
    { from: "n0", to: "x3", w: 200 },
    { from: "x3", to: "x4", w: 200 },
    { from: "x4", to: "sA1", w: 200 },

    //=======Rota Sala B=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x5", w: 130 }, //x1 -> x5
    { from: "x5", to: "x6", w: 130 }, //x5 -> x6
    { from: "x6", to: "x7", w: 130 }, //x6 -> x7
    { from: "x7", to: "x8", w: 130 }, //x7 -> x8
    { from: "x8", to: "sB1", w: 130 }, //x8 -> Sala B

    //=======Rota para Estacionameto B=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x5", w: 130 }, //x1 -> x5
    { from: "x5", to: "x6", w: 130 }, //x5 -> x6
    { from: "x6", to: "x7", w: 130 }, //x6 -> x7
    { from: "x7", to: "x8", w: 130 }, //x7 -> x8
    { from: "x8", to: "n11", w: 130 }, //x8 -> Estacionamento B

    //=======Rota para Igreja Bom Pastor=======
    { from: "x0", to: "x1", w: 130 }, //x0 -> x1
    { from: "x1", to: "x5", w: 130 }, //x1 -> x5
    { from: "x5", to: "x6", w: 130 }, //x5 -> x6
    { from: "x6", to: "x7", w: 130 }, //x6 -> x7
    { from: "x7", to: "x8", w: 130 }, //x7 -> x8
    { from: "x8", to: "x9", w: 130 }, //x8 -> x9
    { from: "x9", to: "x10", w: 130 }, //x9 -> x10
    { from: "x10", to: "n10", w: 130 }, //x10 -> Igreja Bom pastor

    //=======Rotas para o Pós unifametro=======
    { from: "n9", to: "x11", w: 106 },
    { from: "x11", to: "n13", w: 41 },


    //=======Rota para o espaço verde=======
    { from: "n9", to: "x11", w: 106 },
    { from: "x11", to: "x17", w: 106 },
    { from: "x17", to: "x18", w: 106 },
    { from: "x18", to: "x19", w: 106 },
    { from: "x19", to: "n12", w: 41 },

    //=======Rota para os elevadores =======
    { from: "x11", to: "x20", w: 202 },
    { from: "x20", to: "x21", w: 202 },
    { from: "x21", to: "n15", w: 202 },

    //=======Rota para os elevadores =======
    { from: "x11", to: "x20", w: 202 },
    { from: "x20", to: "x21", w: 202 },
    { from: "x21", to: "x22", w: 202 },
    { from: "x22", to: "n14", w: 202 },

  ],
};

export const mapData4Andar = {
  nodes: {
    n0: { id: "n0", name: "Elevador 4° andar - Ponto de Partida", x: 130, y: 100 },
    n3: { id: "n3", name: "Banheiros", x: 315, y: 100 },
    sB1: { id: "sB1", name: "Sala 404", x: 527, y: 220 },

    //Pontos curvas invisíveis
    x1: { id: "x1", x: 130, y: 150 },
    x2: { id: "x2", x: 315, y: 150 },
  },
  edges: [
    //=======Rota para os banheiros=======
    { from: "n0", to: "x1", w: 130 },
    { from: "x1", to: "x2", w: 130 },
    { from: "x2", to: "n3", w: 130 },
  ],
};

export const mapData7Andar = {
  nodes: {
    n0: { id: "n0", name: "Elevador 7° andar - Ponto de Partida", x: 130, y: 100 },
    n3: { id: "n3", name: "Banheiros", x: 315, y: 100 },
    n16: { id: "n16", name: "Recepcao", x: 235, y: 190 },
    n17: { id: "n17", name: "Coordenação - Projeto Extensão", x: 235, y: 590 },

    //Pontos curvas invisíveis
    x1: { id: "x1", x: 130, y: 150 },
    x2: { id: "x2", x: 315, y: 150 },
    x3: { id: "x3", x: 235, y: 150 },
    x4: { id: "x4", x: 154, y: 150 },
    x5: { id: "x5", x: 154, y: 569 },
    x6: { id: "x6", x: 235, y: 569 },

  },
  edges: [
    //=======Rota para os banheiros=======
    { from: "n0", to: "x1", w: 130 },
    { from: "x1", to: "x2", w: 130 },
    { from: "x2", to: "n3", w: 130 },

    //=======Rota para a recepcao=======
    { from: "n0", to: "x1", w: 130 },
    { from: "x1", to: "x3", w: 130 },
    { from: "x3", to: "n16", w: 130 },

    //=======Rota para a coordenacao=======
    { from: "n0", to: "x1", w: 130 },
    { from: "x1", to: "x4", w: 130 },
    { from: "x4", to: "x5", w: 130 },
    { from: "x5", to: "x6", w: 130 },
    { from: "x6", to: "n17", w: 130 },

  ],
};

// Algoritmo de Dijkstra para calcular rota
export function calculateRoute(nodes, edges, origin, destination) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  Object.keys(nodes).forEach((node) => {
    distances[node] = Infinity;
    unvisited.add(node);
  });

  distances[origin] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let minDist = Infinity;

    unvisited.forEach((node) => {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    });

    if (current === null || distances[current] === Infinity) break;

    unvisited.delete(current);

    edges.forEach((edge) => {
      if (edge.from === current && unvisited.has(edge.to)) {
        const alt = distances[current] + edge.w;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = current;
        }
      }
      if (edge.to === current && unvisited.has(edge.from)) {
        const alt = distances[current] + edge.w;
        if (alt < distances[edge.from]) {
          distances[edge.from] = alt;
          previous[edge.from] = current;
        }
      }
    });
  }

  // Reconstruir caminho
  const path = [];
  let current = destination;

  while (current !== undefined) {
    path.unshift(nodes[current]);
    current = previous[current];
  }

  return path;
}
