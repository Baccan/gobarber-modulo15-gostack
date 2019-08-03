module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      // adiciona uma coluna avatar_id na tabela users
      'users',
      'avatar_id',
      {
        // tipo da coluna
        type: Sequelize.INTEGER,
        // referencia da tabela files o id
        // o id contido na tabela users será o id da tabela files
        references: { model: 'files', key: 'id' },
        // Caso seja alterado o arquivo da tabela files, se torna:
        onUpdate: 'CASCADE', // CASCADE = o mesmo na tabela users
        // Caso seja deletado o arquivo da tabela files, o avatar_id se torna:
        onDelete: 'SET NULL',
        // por padrão já é true, mas esta setado para forçar a condção
        allowNull: true,
      }
    );
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
