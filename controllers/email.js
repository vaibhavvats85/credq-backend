const { sendMail2Requestor } = require("../utils/email");

exports.email = async (req, res) => {
  const user = req.body;
  const def = await sendMail2Requestor("info@credq.org", user);
  if (def === "Successful!") return  res.status(200).send(def);
  return res.status(400).send(def);
};
