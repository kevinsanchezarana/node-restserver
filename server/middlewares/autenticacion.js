const jwt = require('jsonwebtoken');

//Verificacion del token
const verificaToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, process.env.SEED_TOKEN, (err, payload) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: { message: 'Token no válido' }
            });
        }

        //Inyectamos al request el payload
        req.usuario = payload.usuario;
        next();

    });
}

//Verifica admin role
const verificaAdminRole = (req, res, next) => {

    const { role } = req.usuario;

    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: { message: 'No tiene permisos para realizar dicha operación' }
        });
    }

    next();

}

module.exports = {
    verificaToken,
    verificaAdminRole
}