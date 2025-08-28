export const groups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((g, i) => {
  return {
    id: i + 1,
    code: g,
    name: `Grupo ${g}`,
  };
});
