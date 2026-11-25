
import type { FeedPost, Student, FeedComment } from '../features/feed/types/feed.types'
import type { PostApi, UserApi } from '../features/feed/types/feedApi.types'

export function mapUserToStudent(user: UserApi): Student {
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
    }
    }

    export function mapPostToFeedPost(
    post: PostApi,
    author: Student,
    ): FeedPost {
    return {
        id: String(post.postId),
        author,
        timeLabel: new Date(post.createdAt).toLocaleDateString('pt-BR'),
        topic: 'Comunidade',
        text: post.content,
        likes: post.likesCount,
        comments: [],
        commentsCount: post.commentsCount,
        imageUrls: post.files,
    }
    }

    export function mapPostsWithAuthors(
    posts: PostApi[],
    users: UserApi[],
    ): FeedPost[] {
    const usersMap = new Map(
        users.map(user => [user.userid, mapUserToStudent(user)])
    )

    return posts.map(post => {
        const author = usersMap.get(post.userId)

        if (!author) {
        throw new Error(`Autor não encontrado: ${post.userId}`)
        }

        return mapPostToFeedPost(post, author)
    })
    }


   type PostWithReplies = PostApi & {
    replies: PostWithReplies[]
}

export function mapPostsToFeedComments(
    posts: PostWithReplies[],
    users: UserApi[],
): FeedComment[] {
    const usersMap = new Map(
        users.map(user => [
            user.userid,
            mapUserToStudent(user),
        ])
    )

    return posts.map(post => {
        const author = usersMap.get(post.userId)

        if (!author) {
            throw new Error(`Autor não encontrado: ${post.userId}`)
        }

        return {
            id: String(post.postId),
            author,
            text: post.content,
            replies: mapPostsToFeedComments(
                post.replies,
                users,
            ),
        }
    })
}