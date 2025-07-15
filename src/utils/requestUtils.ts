// src/utils/requestUtils.ts
import { HistoryRequest } from '../../types'; // Adjust path if types.ts is not two levels up

export const recalculateAttachmentsStatus = (reqToUpdate: HistoryRequest): HistoryRequest => {
    const hasNfNumber = !!reqToUpdate.nf_number?.trim();
    const hasNfFiles = reqToUpdate.nf_attachments && reqToUpdate.nf_attachments.length > 0;
    const hasPixFiles = reqToUpdate.pix_attachments && reqToUpdate.pix_attachments.length > 0;

    if (hasNfNumber && hasNfFiles && hasPixFiles) {
        return { ...reqToUpdate, attachments_status: 1 };
    }
    return { ...reqToUpdate, attachments_status: 0 };
};
