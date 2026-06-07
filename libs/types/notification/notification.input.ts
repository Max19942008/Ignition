import { Direction } from '../../enums/common.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

interface NISearch {
	status?: NotificationStatus;
	group?: NotificationGroup;
	type?: NotificationType;
}

export interface NotificationInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: NISearch;
}
