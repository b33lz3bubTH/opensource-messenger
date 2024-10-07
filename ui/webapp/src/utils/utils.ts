
export function wordWrap(text: string, trimLen: number = 40){
    if(text.length < trimLen){
        return text;
    }
    return text.substring(0, trimLen) + "..."
}
