
//function that converts time from ISO 8601 format to a more readable format
export function ReadableDate(props: any){
    const date = new Date(props.iso_string);

    return new Intl.DateTimeFormat().format(date);

}

export function DateWithTime(props: any){
    const date = new Date(props.iso_string);
    let formatted_date = new Intl.DateTimeFormat(
        undefined, {
            year: "numeric", month: "numeric", 
            day: "numeric", hour: "numeric", 
            minute: "numeric", hour12: true
        }
    ).format(date);
    console.log(formatted_date);
    return formatted_date;
}