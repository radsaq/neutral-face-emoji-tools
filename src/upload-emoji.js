import _ from 'lodash';
import axios from 'axios';
import uuid from 'uuid';

import getSlackApiData from './get-slack-api-data';

const MAX_CONCURRENT_REQUESTS = 5;

const slackApi = axios.create({
  baseURL: `${window.location.origin}/api`
});

const NO_OP = function () {};

export default function uploadEmoji (file, callback = NO_OP) {
  const { apiToken, versionUid } = getSlackApiData();
  const timestamp = Date.now() / 1000;
  const version = versionUid ? versionUid.substring(0, 8) : 'noversion';
  const id = uuid.v4();
  const name = file.name.split('.')[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('mode', 'data');
  formData.append('token', apiToken);
  formData.append('image', file);

  slackApi({
    method: 'post',
    url: `/emoji.add`,
    params: {
      '_x_id': `${version}-${timestamp}`
    },
    data: formData,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).catch((error) => {
    callback(error, null);
  }).then((response) => {
    const error = _.get(response, 'data.error');
    callback(error, response);
  });

  return id;
}
