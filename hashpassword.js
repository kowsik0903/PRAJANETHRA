const bcrypt = require("bcrypt");

const password = "Skowsik"; // Replace with your current admin password

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log(hash);
});