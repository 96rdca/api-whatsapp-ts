export default interface LeadExternal {
    checkNumber(phone: string): Promise<any>
    sendMsg({ message, phone }: { message: string, phone: string }): Promise<any>
    sendMsgWithPhoto({ message, phone }: { message: string, phone: string }): Promise<any>
}