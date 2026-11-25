
export interface Chat {
    chatid: number
    chattypeid: number
    ownerid: string
    chatname: string
    chatdescription: string
    createdat: string
    updateat: string
    }

    export interface ChatUser {
    userid: string
    firstname: string
    lastname: string
    profilepicture: string | null
    }

    export interface ChatMessage {
    messageid: number
    userid: string
    chatid: number
    content: string
    sentat: string
    updatedat: string
    deletedat: string | null
    publicuser: ChatUser
    chat: {
        chatid: number
        chatname: string
    }
    }

    export interface CreateChatRequest {
    chattypeid: number
    chatname: string
    chatdescription: string
    membersid: string[]
    }
