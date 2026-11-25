
import { apiRequest } from '../../../services/api/apiClient'
import type {
  Chat,
  ChatMessage,
  CreateChatRequest,
} from '../types/chat.types'

interface GetMyChatsResponse {
  success: boolean
  title: string
  status: number
  response: {
    chats: Chat[]
  }
}

interface GetChatMessagesResponse {
  success: boolean
  title: string
  status: number
  response: {
    messages: ChatMessage[]
    pagination: {
      page: number
      limit: number
      total_Elements: number
      total_Pages: number
    }
  }
}

interface ChatMember {
  userid: string
  firstname: string
  lastname: string
  email?: string
  profilepicture: string | null
  biography?: string | null
  statusid?: number
  followers?: number
  following?: number
}

export interface ChatDetails extends Chat {
  members: ChatMember[]
}

interface GetChatByIdResponse {
  success: boolean
  title: string
  status: number
  response: {
    chat: ChatDetails
    pagination: {
      page: number
      limit: number
      total_Elements: number
      total_Pages: number
    }
  }
}

interface GetMessageByIdResponse {
  success: boolean
  title: string
  status: number
  response: {
    message: ChatMessage
  }
}

interface CreateChatResponse {
  success: boolean
  title: string
  status: number
  response: {
    chat: Chat
  }
}

interface SendMessageResponse {
  success: boolean
  title: string
  status: number
  response: {
    result: string
  }
}

interface AddMemberToChatResponse {
  success: boolean
  title: string
  status: number
  response: {
    result: string
  }
}

export async function getMyChats(): Promise<Chat[]> {
  const data = await apiRequest<GetMyChatsResponse>('/v1/chats/me')

  return data.response.chats
}

export async function getChatById(
  chatId: number,
  page = 1,
  limit = 100,
): Promise<ChatDetails> {
  const data = await apiRequest<GetChatByIdResponse>(
    `/v1/chats/${chatId}?page=${page}&limit=${limit}`,
  )

  return data.response.chat
}

export async function getChatMessages(
  chatId: number,
): Promise<ChatMessage[]> {
  const data = await apiRequest<GetChatMessagesResponse>(
    `/v1/chats/${chatId}/messages`,
  )

  return data.response.messages
}

export async function getMessageById(
  chatId: number,
  messageId: number,
): Promise<ChatMessage> {
  const data = await apiRequest<GetMessageByIdResponse>(
    `/v1/chats/${chatId}/messages/${messageId}`,
  )

  return data.response.message
}

export async function createChat(
  payload: CreateChatRequest,
): Promise<Chat> {
  const data = await apiRequest<CreateChatResponse>('/v1/chats', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data.response.chat
}

export async function sendMessage(
  chatId: number,
  content: string,
): Promise<SendMessageResponse['response']> {
  const data = await apiRequest<SendMessageResponse>(
    `/v1/chats/${chatId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
  )

  return data.response
}

export async function addMemberToChat(
  chatId: number,
  memberId: string,
): Promise<AddMemberToChatResponse['response']> {
  const data = await apiRequest<AddMemberToChatResponse>(
    `/v1/chats/${chatId}/member/${memberId}`,
    {
      method: 'POST',
    },
  )

  return data.response
}


export async function findDirectChat(
  currentUserId: string,
  targetUserId: string,
): Promise<ChatDetails | null> {
  const chats = await getMyChats()

  const chatDetails = await Promise.all(
    chats.map(chat => getChatById(chat.chatid)),
  )

  const existingChat = chatDetails.find(chat => {
    const memberIds = chat.members.map(member => member.userid)

    return (
      memberIds.length === 2 &&
      memberIds.includes(currentUserId) &&
      memberIds.includes(targetUserId)
    )
  })

  return existingChat ?? null
}
