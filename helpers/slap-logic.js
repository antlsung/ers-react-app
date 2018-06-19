module.exports = {
  async double(pot) {
    if (pot.length > 1) {
        const check = pot.slice(pot.length - 2, pot.length);
        console.log(check);
        if (check[0].Value === check[1].Value) {
          console.log('----double true');
          return Promise.reject(false);
        } else {
          console.log('----double false');
          return Promise.resolve(true);
        }
    } else {
        return Promise.resolve(true);
    }
  },

  async sandwich(pot) {
    if (pot.length > 2) {
      const check = pot.slice(pot.length - 3, pot.length);
      console.log('-----', check);
      if (check[0].Value === check[2].Value) {
        console.log('----sandwich true');
        return Promise.reject(false);
      } else {
        console.log('----sandwich false');
        return Promise.resolve(true);
      }
    } else {
      return Promise.resolve(true);
    }
  },

  async kingAndQueen(pot) {
    return [];
  },

  async topAndBottom(pot) {
    return [];
  }
};
