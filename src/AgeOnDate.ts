import moment from 'moment';

export default class AgeOnDate {
    constructor(private readonly eventDate: Date) { }

    getYears(dateOfBirth: Date) {
        return moment(this.eventDate).diff(moment(dateOfBirth), 'years', true);
    }
}