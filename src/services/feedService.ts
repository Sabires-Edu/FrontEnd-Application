
import { apiRequest } from './api/apiClient'
import type { FeedPost } from '../features/feed/types/feed.types'
import { mapPostsWithAuthors, mapPostsToFeedComments, } from '../utils/feedMapper'
import type { FeedComment } from '../features/feed/types/feed.types'
import type { Student } from '../features/feed/types/feed.types'
import type {PostsResponse, PostResponse, UserResponse, UserApi, CommentsResponse, PostApi, UsersResponse,} from '../features/feed/types/feedApi.types'

    export async function getPosts() {
    return apiRequest<PostsResponse>('/v1/posts', {
        method: 'GET',
    })
}

    export async function getUserPosts() {
    return apiRequest<PostsResponse>('/v1/posts/me', {
        method: 'GET',
    })
}


    export async function getTrashPosts() {
    return apiRequest<PostsResponse>('/v1/posts/me/trash', {
        method: 'GET',
    })
}


export async function insertPostTrash(postId: number) {
    return apiRequest(`/v1/posts/me/trash/${postId}`, {
        method: 'POST',
    })
}

export async function restoreTrashPost(postId: number){
    return apiRequest(`/v1/posts/me/trash/restore/${postId}`,{
        method: 'DELETE',
    })
}

export async function removeTrashPost(postId: number) {
    return apiRequest(`/v1/posts/me/trash/remove/${postId}`,{
        method: 'DELETE',
    })
    
}


    export async function getUserById(userId: string) {
    return apiRequest<UserResponse>(`/v1/users/${userId}`, {
        method: 'GET',
    })
}

export async function getAllUsers() {
    const firstPage = await apiRequest<UsersResponse>(
        '/v1/users?page=1',
        { method: 'GET' }
    )

    const totalPages = firstPage.response.pagination.total_Pages

    const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
            apiRequest<UsersResponse>(
                `/v1/users?page=${index + 2}`,
                { method: 'GET' }
            )
        )
    )

    const users = [
        ...firstPage.response.users,
        ...remainingPages.flatMap(page => page.response.users),
    ]

    return users
}


export function mapUsersToStudents(users: UserApi[]): Student[] {
    return users.map(user => {
        const name = `${user.firstname} ${user.lastname}`.trim()

        const initials = name
            .split(' ')
            .filter(Boolean)
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()

        return {
            id: user.userid,
            name,
            initials,
            photoUrl: user.profilepicture ?? undefined,
            course: '',
            institution: '',
            tone: 'teal',
            followers: user.followers,
            following: user.following,
            followerStatusId: user.followerstatusid,
        }
    })
}

    export async function getPostById(postId: number) {
    return apiRequest<PostResponse>(`/v1/posts/${postId}`, {
        method: 'GET',
    })
}

export async function getUsersByIds(
    userIds: string[],
): Promise<UserApi[]> {
    const uniqueIds = [...new Set(userIds)]

    const users = await Promise.all(
    uniqueIds.map(async (userId) => {
    const result = await getUserById(userId)
    return result.response.user
    }),
)

    return users
}

export async function getFeedPosts(): Promise<FeedPost[]> {
    const postsResponse = await getPosts()

    const posts = postsResponse.response.posts

    const users = await getUsersByIds(
    posts.map((post) => post.userId)
)

    return mapPostsWithAuthors(posts, users)
}

export async function getTrashFeedPosts(): Promise<FeedPost[]> {
    const trashResponse = await getTrashPosts()

    const posts = trashResponse.response.posts

    if (posts.length === 0) {
        return []
    }

    const users = await getUsersByIds(
        posts.map(post => post.userId)
    )

    return mapPostsWithAuthors(posts, users)
}


export async function getUserFeedPosts(): Promise<FeedPost[]> {
    const postsResponse = await getUserPosts()

    const posts = postsResponse.response.posts

    const users = await getUsersByIds(
        posts.map((post) => post.userId)
    )

    return mapPostsWithAuthors(posts, users)
}

/*Consulta as publicações */
export async function getLikedPosts() {
    return apiRequest<PostsResponse>('/v1/posts/me/likes', {
        method: 'GET',
    })
}

export async function getLikedPostIds(): Promise<string[]> {
    const result = await getLikedPosts()

    return result.response.posts.map(post => String(post.postId))
}

export async function likePost(postId: string) {
    return apiRequest<unknown>(`/v1/posts/me/like/${postId}`, {
        method: 'POST',
    })
    }

export async function unlikePost(postId: string) {
    return apiRequest<unknown>(`/v1/posts/me/dislike/${postId}`, {
        method: 'DELETE',
    })
    }

export async function getPostComments(postId: number) {
    return apiRequest<CommentsResponse>(
    `/v1/posts/${postId}/comments`,
    {
        method: 'GET',
    },
    )
}


type PostWithReplies = PostApi & {
  replies: PostWithReplies[];
};

async function getCommentsWithReplies(
  postId: number
): Promise<PostWithReplies[]> {
  const result = await getPostComments(postId);
  const posts = result.response.posts ?? [];

  return Promise.all(
    posts.map(async (post) => ({
      ...post,
      replies: await getCommentsWithReplies(post.postId),
    }))
  );
}

export async function getFeedComments(
  postId: number
): Promise<FeedComment[]> {
  const posts = await getCommentsWithReplies(postId);

  function collectUserIds(items: PostWithReplies[]): string[] {
    return items.flatMap((item) => [
      item.userId,
      ...collectUserIds(item.replies),
    ]);
  }

  const users = await getUsersByIds(collectUserIds(posts));

  return mapPostsToFeedComments(posts, users);
}


export async function createFeedComment(
    content: string,
    rootPostId: number,
    parentPostId: number,
    ) {
    const formData = new FormData()

    formData.append('Content', content)
    formData.append('RootPostId', String(rootPostId))
    formData.append('ParentPostId', String(parentPostId))

    return apiRequest<unknown>('/v1/posts', {
        method: 'POST',
        body: formData,
    })
}


export async function createFeedPost(
    content: string,
    images: File[],
) {
    const formData = new FormData()

    formData.append('Content', content)

    images.forEach(image => {
        formData.append('Images', image)
    })

    return apiRequest<unknown>('/v1/posts', {
        method: 'POST',
        body: formData,
    })
}
