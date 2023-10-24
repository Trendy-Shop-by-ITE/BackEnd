const db = require('../config/database/db.config')
const jwt = require('jsonwebtoken')
const bycript = require('bcrypt')
require('dotenv').config();
const create = (req, res) => {
    var message = {}
    var body = req.body;
    var { username, phone, email, gender } = req.body
    var password = bycript.hashSync(body.password, 10)
    var sqlStatement = "INSERT INTO `users` (username, phone, email, gender, password) VALUES (?, ?, ?, ?, ?)"
    if (username == null || username == "") {
        message.username = "username is required"
    }
    if (phone == null || phone == "") {
        message.phone = "phone is required"
    }
    if (gender == null || gender == "") {
        message.gender = "gender is required"
    }
    if (password == null || password == "") {
        message.password = "password is required"
    }
    if (Object.keys(message).length > 0) {
        res.json({
            err: true,
            message: message
        })
        return
    }

    db.query("SELECT * FROM `users` WHERE phone = ?", [phone], (err, row) => {
        if (!err) {
            if (row.length > 0) {
                res.json({
                    message: "phone is already"
                })
            } else {
                var paramInsert = [username, phone, email, gender, password]
                db.query(sqlStatement, paramInsert, (err, row) => {
                    if (err) {
                        res.json({
                            err: true,
                            message: err
                        })
                    }
                    else {
                        res.json({
                            message: "success create",
                            user: row
                        })
                    }
                })
            }
        }
    })

}

const getOne = (req, res) => {
    var id = req.params.id
    var sqlStatement = "SELECT * FROM users WHERE user_id = ?"
    var param = [id]
    db.query(sqlStatement, param, (err, row) => {
        if (err) {
            res.json({
                err: true,
                message: err
            })
        }
        else {
            res.json({
                user: row
            })
        }
    })
}

const getOneWithAddress = (req, res) => {
    var authenticatedUserId = req.user.user_id; // Get the authenticated user's ID from the middleware
    var userId = req.params.id;

    // Check if the authenticated user matches the user in the request
    if (authenticatedUserId == userId) {
        var sqlStatement = `
            SELECT users.*, addresses.village, addresses.commune, addresses.district, addresses.province, addresses.location_code
            FROM users
            LEFT JOIN addresses ON users.user_id = addresses.user_id
            WHERE users.user_id = ?;
        `;
        var param = [userId];

        db.query(sqlStatement, param, (err, rows) => {
            if (err) {
                res.json({
                    err: true,
                    message: err
                });
            } else {
                if (rows.length === 0) {
                    res.json({
                        err: true,
                        message: 'User not found'
                    });
                } else {
                    res.json({
                        user: rows[0] // Assuming there is only one user with this ID
                    });
                }
            }
        });
    } else {
        // User is not authorized to access this user's information
        res.status(403).json({ error: "You don't have permission to access this user's information" });
    }
}


const getAll = (req, res) => {
    db.query("SELECT * FROM users", (err, row) => {
        if (err) {
            res.json({
                err: true,
                message: err
            })
        }
        else {
            res.json({
                user: row
            })
        }
    })

}

const updateUser = (req, res) => {
    var body = req.body
    var password = bycript.hashSync(body.password, 10)
    var sqlStatement = "UPDATE users SET username = ?, phone = ?, email = ?, gender = ?, password = ? WHERE user_id = ? "
    var pramm = [body.username, body.phone, body.email, body.gender, password, body.id]
    // db.query("SELECT * FROM `user` WHERE phone = ?", [body.phone],(err, row) => {
    //     if(!err){
    //         if(row.length>0){
    //             res.json({
    //                 message: "phone is already"
    //             })
    //         }else{
    //             db.query(sqlStatement, pramm, (err, row) => {
    //                 if (err) {
    //                     res.json({
    //                         err: true,
    //                         message: err
    //                     })
    //                 }
    //                 else {
    //                     res.json({
    //                         message: "update successfully",
    //                         user: row
    //                     })
    //                 }
    //             })
    //         }
    //     }
    // })

    db.query(sqlStatement, pramm, (err, row) => {
        if (err) {
            res.json({
                err: true,
                message: err
            })
        }
        else {
            res.json({
                message: "update successfully",
                user: row
            })
        }
    })

}

const deleteUser = (req, res) => {
    var id = req.params.id
    var sqlStatement = "DELETE  FROM users WHERE user_id = ? "
    var param = [id]

    db.query("SELECT * FROM users WHERE user_id = ?", param, (err, row) => {
        if (!err) {
            if (row.length > 0) {
                db.query(sqlStatement, param, (err, row) => {
                    if (err) {
                        res.json({
                            err: true,
                            message: err
                        })
                    }
                    else {
                        res.json({
                            message: "delete successfully"
                        })
                    }
                })
            } else {
                res.json({
                    message: "user does not exit"
                })
            }
        }
    })


}

const userLogin = (req, res) => {
    const { password, phone } = req.body;
    const message = {};

    if (phone == null || phone == "") {
        message.phone = "phone is required";
    }
    if (password == null || password == "") {
        message.password = "password is required";
    }
    if (Object.keys(message).length > 0) {
        res.json({
            err: true,
            message: message
        });
        return;
    }

    db.query("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) {
            res.json({
                error: true,
                message: "Error occurred while fetching user"
            });
            return;
        }

        if (row.length == 0) {
            res.json({
                error: true,
                message: {
                    error: true,
                    phone: "Phone does not exist"
                }
            });
        } else {
            const user = row[0];
            const passwordDb = user.password;
            const isCorrectPassword = bycript.compareSync(password, passwordDb);
            if (isCorrectPassword) {
                if (user.role === "user") {
                    delete user.password;

                    const obj = {
                        user: user,
                        role: "user", // Set the role as "user" for user login
                        token: ""
                    };

                    const access_token = jwt.sign({ data: { ...obj } }, process.env.TOKEN_KEY);

                    res.json({
                        ...obj,
                        access_token: access_token
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Login fail",
                        messages: {
                            role: "You don't have permission to login"
                        }
                    });
                }
            } else {
                res.json({
                    error: true,
                    message: "Login fail",
                    messages: {
                        password: "Password incorrect!"
                    }
                });
            }
        }
    });
};
const adminLogin = (req, res) => {
    const { password, phone } = req.body;
    const message = {};

    if (phone == null || phone == "") {
        message.phone = "phone is required";
    }
    if (password == null || password == "") {
        message.password = "password is required";
    }
    if (Object.keys(message).length > 0) {
        res.json({
            err: true,
            message: message
        });
        return;
    }

    db.query("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) {
            res.json({
                error: true,
                message: "Error occurred while fetching user"
            });
            return;
        }

        if (row.length == 0) {
            res.json({
                error: true,
                message: {
                    error: true,
                    phone: "Phone does not exist"
                }
            });
        } else {
            const user = row[0];
            const passwordDb = user.password;
            const isCorrectPassword = bycript.compareSync(password, passwordDb);
            if (isCorrectPassword) {
                if (user.role === "admin") {
                    delete user.password;

                    const obj = {
                        user: user,
                        role: "admin", // Set the role as "user" for user login
                        token: ""
                    };

                    const access_token = jwt.sign({ data: { ...obj } }, process.env.TOKEN_KEY);

                    res.json({
                        ...obj,
                        access_token: access_token
                    });
                } else {
                    res.json({
                        error: true,
                        message: "Login fail",
                        messages: {
                            role: "You don't have permission to login"
                        }
                    });
                }
            } else {
                res.json({
                    error: true,
                    message: "Login fail",
                    messages: {
                        password: "Password incorrect!"
                    }
                });
            }
        }
    });
};



module.exports = {
    create,
    getOne,
    getAll,
    updateUser,
    deleteUser,
    userLogin,
    getOneWithAddress,
    adminLogin
}