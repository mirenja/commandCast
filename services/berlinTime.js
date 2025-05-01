export function getBerlinTime(createdAt){

    const berlinTime = createdAt.toLocaleString("de-DE",{
        timeZone: "Europe/Berlin",
        hour12: false,
    })

    const [date, time] = berlinTime.split(', ')
    return { date, time }

}