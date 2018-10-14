interface TelegramMessageIncoming{
    update_id: number
    message:TelegramFieldMessage

}
interface TelegramFieldMessage{
    message_id : number
    from : TelegramFieldFrom
    chat : TelegramFieldChat
    date: number
    text: string

}
interface TelegramFieldFrom{
    id : number
    is_bot : boolean
    first_name: string
    last_name: string
    username: string
    language_code: string

}
interface TelegramFieldChat{
    id : number
    first_name: string
    last_name: string
    username: string
    type: string

}
