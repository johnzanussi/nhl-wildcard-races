export const formatDate = (dateString: string) => {

    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);

};
