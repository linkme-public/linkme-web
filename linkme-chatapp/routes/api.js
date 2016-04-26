var router = require("express").Router();

router.get('/', function (req, res) {
    res.send({ message: "Api is running." });
});

module.exports = router;