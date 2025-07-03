const express = require("express");
const { getAllUsersController,getAllDoctorsController,changeAccountStatusController,blockUnblockUserController } = require("../controllers/adminCtrl");

const authMiddleware = require("../middlewares/authmiddleware");

const router = express.Router();
//get method ||users
router.get('/getAllUsers',authMiddleware,getAllUsersController);
//get method ||doctors
router.get('/getAllDoctors',authMiddleware,getAllDoctorsController);
//POST ACCOUNT STATUS
router.post("/changeAccountStatus",authMiddleware,changeAccountStatusController);

router.post('/blockUnblockUser', authMiddleware, blockUnblockUserController);
module.exports = router;