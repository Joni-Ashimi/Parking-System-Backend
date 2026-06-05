export class CreateFeedbackDto {
    subject: string;
    category: string;
    message: string;
    photos?: string[];
}