import userModal from "../models/userModel.js";
import { checkRequiredField } from "../helpers/authHelper.js";
import { google } from "googleapis";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
export const getUsers = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const query = searchQuery
      ? {
          $or: [
            { first_name: { $regex: searchQuery, $options: "i" } },
            { last_name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};
    const [users, totalItems] = await Promise.all([
      userModal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      userModal.countDocuments(query),
    ]);
    res.status(200).send({
      users: users.filter((el) => el?.role !== "admin"),
      currentPage: page,
      total: totalItems,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

//Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    checkRequiredField("id", id);
    const user = await userModal.findOne({ _id: id });
    user.verified = Boolean(!user?.verified);
    await user.save();
    res.status(201).send({
      message: `${user?.first_name + " " + user?.last_name} status is ${
        user?.verified ? "activate" : "deactivate"
      } now`,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error?.message,
      success: false,
    });
  }
};
