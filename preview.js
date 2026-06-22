const fs = require('fs');

function preview(rows, palette) {
  for (const row of rows) {
    let line = '';
    for (const char of row) {
      if (char === '.') {
        line += '\x1b[0m  ';
      } else {
        const hex = palette[char];
        if (!hex) {
          line += '\x1b[0m??';
          continue;
        }
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        line += `\x1b[48;2;${r};${g};${b}m  `;
      }
    }
    line += '\x1b[0m';
    console.log(line);
  }
}

const boleto = {
  palette: { O: "#1a0a14", P: "#ff69b4", p: "#c2185b", H: "#ffb3d9", M: "#6b4423", m: "#a0673a", C: "#00e5ff", A: "#ff00ff", Y: "#ffea00", W: "#8b5a2b", w: "#5d3a1a", G: "#ffd700", E: "#ffffff", B: "#1a1a1a", T: "#fff8e7" },
  rows: [
    "........................",
    ".......OOOOOO...........",
    "......OMMMMMMO..........",
    ".....OMMMMMMMMO.........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
    "....OMMMMMMMMMMO........",
  ]
};

preview(boleto.rows, boleto.palette);
