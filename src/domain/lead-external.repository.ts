export default interface LeadExternal {
    sendMsg({ message, phone }: { message: string, phone: string }): Promise<any>
    checkNumber(phone: string): Promise<any>
}