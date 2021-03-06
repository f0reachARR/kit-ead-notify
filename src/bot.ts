import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import { config } from './config';
import { LectureInfoEntity, NotificationEntity } from './database';

export const notifyLectureSingle = async (
  info: LectureInfoEntity,
  webhook: string,
) => {
  const updatedAt = DateTime.fromString(info.updatedAt, 'yyyy-MM-dd');
  const createdAt = DateTime.fromString(info.createdAt, 'yyyy-MM-dd');
  const res = await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
      embeds: [
        {
          title: `[${info.category}] ${info.subject}`,
          author: {
            name: '授業連絡',
          },
          description: info.content,
          fields: [
            {
              name: '学部・学期',
              value: `${info.faculty} ${info.semester}`,
              inline: true,
            },
            {
              name: '時限',
              value: `${info.day || '不明'}${
                info.hour ? info.hour + '限' : ''
              }`,
              inline: true,
            },
            {
              name: '教員',
              value: info.teacher,
              inline: true,
            },
          ],
          footer: {
            text: `更新:${updatedAt.toFormat(
              'yyyy/MM/dd',
            )} 作成:${createdAt.toFormat('yyyy/MM/dd')}`,
          },
        },
      ],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('failed to call hook');
  }
};

export const notifyNotificationSingle = async (
  info: NotificationEntity,
  webhook: string,
) => {
  const publishedAt = DateTime.fromString(info.publishedAt, 'yyyy-MM-dd');
  const embed: Record<string, unknown> = {
    title: `[${info.category}] ${info.title}`,
    author: {
      name: '学生情報ポータル',
    },
    description: info.description,
    footer: {
      text: `${publishedAt.toFormat('yyyy/MM/dd')}`,
    },
  };

  if (info.url) {
    embed.url = info.url;
  }
  const res = await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
      embeds: [embed],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('failed to call hook');
  }
};

export const notifyNotification = async (info: NotificationEntity) => {
  for (const webhook of config.webhook.notification) {
    await notifyNotificationSingle(info, webhook);
  }
};

export const notifyLecture = async (info: LectureInfoEntity) => {
  for (const webhook of config.webhook.lecture) {
    await notifyLectureSingle(info, webhook);
  }
};
