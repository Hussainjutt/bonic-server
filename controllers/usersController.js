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
// export const testController = async (req, res) => {
//   try {
//     const email =
//       "analytics-test@analytics-test-402512.iam.gserviceaccount.com";
//     const id = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFxOyGHk/h0+9I\nAIQ+qkIQ9L0viPzvsTfnlKQ51fFdgJPQaUl6NNsqk60E/QXpTRohdLg52EQI59mU\n/8q9VLsv7LdXqnJyzogmKr9q5s4LwR6XGzdD4qcbJepEB9Ee2iugkK8faMdXu3++\nxnHSQqeXNfafltOiAbLgVCicuNqHO2JsmIKImvIZbAVct6pMiaS3YGbk7Ml6bHaR\noRlaDTgpUyxo94aPv8BOSzGBixHdViDWP+TlG7WiZ8bzhmS2Up8/5u59g+5RgKWH\nbCgkJzzNap1+ErndRznTua/Ge8o33PsdqXIJzNoMuOW1Er7+pQGdt3WNJxikH/32\n0Uft/CjLAgMBAAECggEAAJwduiNYedPSEsDLI/FptyO6Doe5dwdKUwpmJ1rQ377o\naPnoxAIEoYFoYjsC4G00d1Y6xdOTUlwNHok27af1JRCLQXF2OLZK1n9nwvTThq7W\npphYsGTe9CC78e/8k3bHVKHKYZf8D6llAbROFxaLwevO0f2AeNFUd1TnciBibM6M\nxGkOVchbcfsCKD2j3rM9YRk2R2NkCcKFFYXu1IJYVI+MP7Xev84YG4UUPZCE9RsP\nHHx3bjJkgEP6ocCVZ6xeV3SEEVJam4QaWNq2Xf+w1QIMpgrXcYGgok3WgW2EieMz\nIjJNEkgdzVeEy/EqdXxv7YgLliXo+Op2aOTF+imwKQKBgQDtLeZADFMGlUjEZzHp\nwYaplKmJp0o0S6dafXvTw5ncjiqHtjYOXOgq8RkfzeEcKz/y35+OeZM2U8HVoTNb\nRTYZ8hEgABfhGIEuk2CHvRljIR2ROEdod7M282AV0GPn/yPBYw1zR2/j/0hHdA/h\nIoiZJWhcgnCj+NJu9OxCREqsLwKBgQDVdnEbdKK7Rq9LdyLydTFH8e+Sm8KCNQxt\ntsef8mov270GyFJHRxeKV+Rf7yUwxMcuyvfjR3RuL6xe0q9QM4r3P7gUn1g8E94o\nnH0/lm5XLV/CyoxN4SnI+vhWA6w2gr70Ifi/JuzoMFKVKiXdbpxolQI3mRYJSPS5\naOyRvfOaJQKBgAJE5SYJuCWg+gA/CIA3BMXMkU6q1g/oBWLdPnkJLwioJ4oC2UOL\n6gC3K8ldG+E8HLGDKDChwyHK7VjQ4P/nipv27+kBdzkFFf9PE6ZYzcxf/bts8Wnz\nczh8XZf31WzbyQjJnNBUh6KDx7o/RwOdY/crH3N7H/7Bm6nKGBSOOLSrAoGASB28\ntrbf539I56j3QIyBOros4w4GV7EOYt6WcJ4Ya9TD9s+kpHoLJOzutc54dRJ17IQb\n3UgduMAYbuyk1+ah80guq6Dt0VYw/u1njx0GaCNnL8r4PbNtR34qefzBqKThWF9F\nx2aiMQtqSwSzSCz/YIG+/wOUI0zniOA+1DolW5UCgYEA3IBO5CaI6QN1KJUBTTTt\nkWJJ3ba2ccnoRXkX//pdt+Acr3822cIv3bD1hNNGiUeSTC2B1INkUAjdBsLkl2Eq\noyVxTNh5/m6u02kdXtXx/AxhgNHuhHGzCkFhE4UtM+fimZYaOyxsts+M+UuTAlGU\nYr+VtFU8YHyEd4nNQiMTx3c=\n-----END PRIVATE KEY-----\n`;
//     const viewId = "ga:296799329";
//     const Jwt = new google.auth.JWT(
//       email,
//       null,
//       id.replace(/\\n/g, "/n"),
//       "https://www.googleapis.com/auth/analytics.readonly"
//     );
//     const data = await google.analytics("v3").data.ga.get({
//       auth: Jwt,
//       ids: viewId,
//       "start-date": "today",
//       "end-date": "today",
//       dimensions: "ga:pagePath,ga:pageTitle",
//       metrics:
//         "ga:pageviews,ga:users,ga:sessions,ga:bounceRate,ga:avgSessionDuration",
//       sort: "-ga:pageviews",
//       "max-results": "10",
//       filters: "ga:medium==organic",
//     });

//     res.status(201).send({
//       message: "hi",
//       data: data.data,
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error?.message,
//       success: false,
//     });
//   }
// };

export const testController = async (req, res) => {
  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
      "../analytics-test-402512-0d400ea4f46b.json";
    const propertyId = "properties/412451847";
    const startDate = "2023-01-01";
    const endDate = "2023-01-31";

    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [
        {
          name: "city",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });

    res.status(200).send({
      message: "Analytics data fetched successfully",
      data: response,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error?.message,
      success: false,
    });
  }
};
