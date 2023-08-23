module.exports = {
    name: 'ready',
    once: true,
    dispatch(client) {
        console.log(`\x1b[44;97m${client.user.tag} has successfully logged on\x1b[0m`);
    }
}