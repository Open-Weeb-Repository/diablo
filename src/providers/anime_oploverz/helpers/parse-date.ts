import moment from "moment";

/*expected input "Agu 10, 2020"*/
export default function opLoverParseDate(dateString: string): Date {
    // replace first 3 with month
    const monthString = dateString.slice(0, 2);
    let month;
    switch (monthString.toLowerCase()) {
        case "des":
            month = "12";
            break;
        case "nov":
            month = "11";
            break;
        case "okt":
            month = "10";
            break;
        case "sep":
            month = "09";
            break;
        case "agu":
            month = "08";
            break;
        case "jul":
            month = "07";
            break;
        case "jun":
            month = "06";
            break;
        case "mei":
            month = "05";
            break;
        case "apr":
            month = "04";
            break;
        case "mar":
            month = "03";
            break;
        case "feb":
            month = "02";
            break;
        default:
            month = "01";
    }
    return moment(`${month} ${dateString.slice(3)} +0700`, "MM DD, YYYY Z").toDate();
}
