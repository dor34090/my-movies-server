export interface UserAction {
    id: number;
    user_id: number;
    movie_id: number;
    action_type: UserActionType;
    created_at: Date;
}

export interface CreateUserActionRequest {
    user_id: number;
    movie_id: number;
    action_type: UserActionType;
}


export enum UserActionType {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    FAVORITE = 'favourite',
    UNFAVORITE = 'unfavourite',
}
