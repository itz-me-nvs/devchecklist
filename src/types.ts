
export interface ChecklistItem {
    id: string;
    label: string;
    // description: string;
    checked?: boolean;
    completed?: boolean;
    createdAt: number;
    isHeader?: boolean;
}