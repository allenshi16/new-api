/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import { getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';
import {
  OpenAI,
  Claude,
  Gemini,
  DeepSeek,
  Qwen,
  Mistral,
} from '@lobehub/icons';

const FooterBar = () => {
  const { t } = useTranslation();
  const systemName = getSystemName();
  const [statusState] = useContext(StatusContext);
  const docsLink = statusState?.status?.docs_link || '';
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: t('产品'), href: '/pricing' },
    { label: t('公司'), href: '/about' },
  ];

  const providerIcons = [
    { Icon: OpenAI, name: 'OpenAI' },
    { Icon: Claude.Color, name: 'Claude' },
    { Icon: Gemini.Color, name: 'Gemini' },
    { Icon: DeepSeek.Color, name: 'DeepSeek' },
    { Icon: Qwen.Color, name: 'Qwen' },
    { Icon: Mistral.Color, name: 'Mistral' },
  ];

  return (
    <footer className='cta-section-enhanced relative bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 dark:from-indigo-900 dark:via-purple-900 dark:to-teal-900 py-6 px-4 md:px-8'>
      <div className='max-w-6xl mx-auto'>

        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <Typography.Text className='text-sm text-white/60'>
            © {currentYear} {systemName} · {t('版权所有')} · {t('一个 API Key，连接所有 AI 模型')}
          </Typography.Text>

          <div className='flex items-center gap-4'>
            {providerIcons.map(({ Icon, name }) => (
              <div
                key={name}
                className='w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity'
                title={name}
              >
                <Icon size={16} />
              </div>
            ))}
            <Typography.Text className='text-xs text-white/50 font-medium'>
              +30
            </Typography.Text>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterBar;
