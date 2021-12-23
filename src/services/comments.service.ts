import CommentModel from "../models/comment.model";
import axios from "axios";
import { PermissionAccessViolation } from "./errors";

export async function getComments(filter: any, page: number, count: number) {
  filter["isDeleted"] = false; // retrieve all non-deleted records

  const results = await CommentModel.paginate(filter, {
    limit: count,
    offset: page * count,
    sort: { createdAt: -1 },
  });

  return results;
}

export async function createComment(comment: any) {
  return await CommentModel.create(comment);
}

export async function updateCommentById(
  commentId: string,
  value: string,
  userId: string
) {
  return await CommentModel.findByIdAndUpdate(commentId, {
    value: value,
  });
}

export async function deleteById(commentId: string, userId: string) {
  return await CommentModel.findByIdAndUpdate(commentId, {
    isDeleted: true,
  });
}

const containsFinancial = (value: string) => {
  const words = value.split(" ");

  let amex = new RegExp("^3[47][0-9]{13}$");
  let visa = new RegExp("^4[0-9]{12}(?:[0-9]{3})?$");
  let cup1 = new RegExp("^62[0-9]{14}[0-9]*$");
  let cup2 = new RegExp("^81[0-9]{14}[0-9]*$");

  let mastercard = new RegExp("^5[1-5][0-9]{14}$");
  let mastercard2 = new RegExp("^2[2-7][0-9]{14}$");

  let disco1 = new RegExp("^6011[0-9]{12}[0-9]*$");
  let disco2 = new RegExp("^62[24568][0-9]{13}[0-9]*$");
  let disco3 = new RegExp("^6[45][0-9]{14}[0-9]*$");

  let diners = new RegExp("^3[0689][0-9]{12}[0-9]*$");
  let jcb = new RegExp("^35[0-9]{14}[0-9]*$");

  return words.some(
    (value) =>
      amex.test(value) ||
      visa.test(value) ||
      cup1.test(value) ||
      cup2.test(value) ||
      mastercard.test(value) ||
      mastercard2.test(value) ||
      disco1.test(value) ||
      disco2.test(value) ||
      disco3.test(value) ||
      diners.test(value) ||
      jcb.test(value)
  );
};

export async function moderateById(commentId: string) {
  const comment = await CommentModel.findById(commentId);
  console.log("Comment found by id " + commentId);
  if (!comment) return;

  try {
    const defaultLanguage = "eng";
    const baseUrl = process.env.AZURE_MODERATION_ENDPOINT as string;
    const azureModeraionKey = process.env.AZURE_MODERATION_KEY as string;

    console.log(baseUrl);

    console.log(azureModeraionKey);

    const detectTextLanguageModerationUrl = `${baseUrl}/contentmoderator/moderate/v1.0/ProcessText/DetectLanguage`;
    const detectLanguageResult = await axios.post(
      detectTextLanguageModerationUrl,
      comment.value,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": azureModeraionKey,
          "Content-Type": "text/plain",
        },
      }
    );

    // set default language to 'eng' if unable to detect
    const language =
      detectLanguageResult.data?.DetectedLanguage || defaultLanguage;

    // screen text now
    const screenTextModerationUrl = `${baseUrl}/contentmoderator/moderate/v1.0/ProcessText/Screen/?language=${language}&classify=true&PII=true`;

    const screenResponse = await axios.post(
      screenTextModerationUrl,
      comment.value,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": azureModeraionKey,
          "Content-Type": "text/plain",
        },
      }
    );

    if (screenResponse.status === 200) {
      const screenResult = screenResponse.data;
      if (language === defaultLanguage) {
        const textContainsFinancials = containsFinancial(comment.value);
        const response = {
          explicit: screenResult.Classification.Category1.Score,
          mature: screenResult.Classification.Category2.Score,
          offensive: screenResult.Classification.Category3.Score,
          isSafe: !(
            screenResult.Classification?.ReviewRecommended ||
            textContainsFinancials
          ),
          address: screenResult.PII?.Address.length > 0,
          email: screenResult.PII?.Email.length > 0,
          network: screenResult.PII?.IPA.length > 0,
          phone: screenResult.PII?.Phone.length > 0,
          ssn: screenResult.PII?.SSN.length > 0,
          financial: textContainsFinancials,
        };

        await CommentModel.findByIdAndUpdate(commentId, {
          moderatedAt: new Date(),
          isModerated: true,
        });
        console.log("updated");
      } else {
        // TODO: handle non english response
        return null;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const validateOwnership = (commentId: string, userId: string) => {
  return new Promise((resolve, reject) => {
    CommentModel.findById(commentId)
      .then((comment) => {
        if (comment?.userId !== userId) {
          reject(new PermissionAccessViolation());
        } else {
          resolve(comment);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
