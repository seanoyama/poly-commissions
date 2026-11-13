
//function that converts time from ISO 8601 format to a more readable format
export function ReadableDate(props: any){
    const date = new Date(props.iso_string);

    return new Intl.DateTimeFormat().format(date);


}