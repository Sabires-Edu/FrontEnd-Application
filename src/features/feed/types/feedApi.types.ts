
export interface PostApi {
    postId: number
    userId: string
    content: string
    rootPostId: number
    parentPostId: number
    files: string[]
    likesCount: number
    commentsCount: number
    createdAt: string
    updatedAt: string
}


export interface PostsResponse {
    success: boolean
    title: string
    status: number
    response: {
    posts: PostApi[]
    pagination: {
    page: number
    limit: number
    total_Elements: number
    total_Pages: number
        }
    }
}

export interface PostResponse {
    success: boolean
    title: string
    status: number
    response: {
        post: PostApi
    }
}

export interface UserApi {
    userid: string
    firstname: string
    lastname: string
    email: string
    profilepicture: string | null
    biography: string | null
    statusid: number
    followers: number
    following: number
    followerstatusid: number
}

export interface UserResponse {
    success: boolean
    title: string
    status: number
    response: {
    user: UserApi
    }
}

export interface UsersResponse {
    success: boolean
    title: string
    status: number
    response: {
        users: UserApi[]
        pagination: {
            page: number
            limit: number
            total_Elements: number
            total_Pages: number
        }
    }
}

export interface CommentsResponse {
    success: boolean
    title: string
    status: number
    response: {
    rootPost?: PostApi
    parentPost?: PostApi
    post: PostApi
    posts: PostApi[]
    pagination: {
    page: number
    limit: number
    total_Elements: number
    total_Pages: number
    }
  }
}