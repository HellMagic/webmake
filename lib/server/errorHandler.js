module.exports = async function (error, request, resonse) {
    console.error(error.stack);
    resonse.status(500).send('Server Error...');
};

