const mongoose = require("mongoose");
const moment = require("moment");
const {
  Schema,
  Types: { ObjectId }
} = mongoose;

const articleLogSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      default: 0
    },
    archive: {
      type: Schema.Types.ObjectId
    },
    archiveDate: {
      type: Schema.Types.Date
    },
    position: {
      type: Number,
      default: -1
    },
    column: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "column"
    }
  },
  {
    timestamps: true
  }
);

articleLogSchema.statics.updateStatus = function() {
  var ArticleLog = this;

  const checkStatus = ({ _id, status, createdAt }) => {
    const compose = (nxt, inc) => m => inc(nxt(m));
    const nextUpdate = months => moment(createdAt).add(months, "months");
    const toIncrease = nextUpdate => moment().isAfter(nextUpdate);

    const processUpdateCheck = compose(
      nextUpdate,
      toIncrease
    );

    const check = (nextUpdate, newStatus) =>
      processUpdateCheck(nextUpdate)
        ? { _id: ObjectId(_id), status: newStatus }
        : false;

    switch (status) {
      case 0:
        return check(1, 1);
      case 1:
        return check(3, 2);
      case 2:
        return check(6, 3);
      default:
        return false;
    }
  };

  const initUpdate = async logs => {
    const updateQuery = ({ _id, status }) => {
      return new Promise(resolve => {
        resolve(ArticleLog.updateOne({ _id }, { $set: { status } }));
      });
    };

    const requests = logs.map(log => {
      const statusChange = checkStatus(log);
      if (statusChange) return updateQuery(statusChange);
    });
    
    return await Promise.all(requests);
  };

  return new Promise((resolve, reject) => {
    ArticleLog.find({ status: { $lt: 3 } })
      .select("_id status createdAt")
      .exec()
      .then(async toUpdate => {
        const updated = await initUpdate(toUpdate);
        resolve({ toUpdate, updated });
      })
      .catch(error => reject(error));
  });
};

module.exports = mongoose.model("articleLog", articleLogSchema);
