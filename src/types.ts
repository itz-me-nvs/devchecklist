
export interface ChecklistItem {
    id: string;
    label: string;
      description?: string; // <- Add this
    checked?: boolean;
    completed?: boolean;
    createdAt: number;
    isHeader?: boolean;
    parentId: string; // parent id of the item
    timer?: number;
    startTime?: number;
    endTime?: number;
    liveDescription?: string;
}



