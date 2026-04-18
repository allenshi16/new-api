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

import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
  Card,
  Banner,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess, getLogo, getSystemName } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
  IconServer,
  IconShield,
  IconCreditCard,
  IconBarChartHStroked,
  IconSync,
  IconBolt,
  IconLayers,
  IconCheckCircleStroked,
  IconArrowRight,
  IconCode,
  IconTickCircle,
  IconUser,
  IconMail,
  IconInfoCircle,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import AnimatedNumber from '../../components/common/AnimatedNumber';
import Typewriter from '../../components/common/Typewriter';
import TiltCard from '../../components/common/TiltCard';
import ParticleBackground from '../../components/common/ParticleBackground';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Mistral,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text, Title } = Typography;

const STATS_DATA = [
  { key: '500+', label: '模型', icon: IconLayers, value: 500 },
  { key: '99.99%', label: '在线率', icon: IconServer, value: 99.99 },
  { key: '全球边缘节点', icon: IconBolt, value: null },
  { key: '企业级安全', icon: IconShield, value: null },
];

const FEATURES_DATA = [
  {
    key: '统一接口',
    subKey: 'OpenAI 兼容',
    descKey: '无需修改代码，只需替换 base_url',
    highlights: ['GPT/Claude/Gemini', '原生 SDK 兼容', '一次接入全部模型'],
    icon: IconSync,
    color: 'indigo',
  },
  {
    key: '智能路由',
    subKey: '自动故障转移',
    descKey: '多节点冗余架构，单点故障自动切换',
    highlights: ['99.99% 在线率', '<100ms 响应延迟', '全球 24+ 边缘节点'],
    icon: IconServer,
    color: 'teal',
  },
  {
    key: '灵活计费',
    subKey: '按量付费 · 无最低消费',
    descKey: '预扣费机制，精确控制成本，杜绝超支风险',
    highlights: ['充值即用', '实时余额提醒', '企业阶梯定价'],
    icon: IconCreditCard,
    color: 'amber',
  },
  {
    key: '企业级安全',
    subKey: 'SOC2 合规标准',
    descKey: '完整权限管理体系，数据隔离与加密',
    highlights: ['子密钥权限控制', 'IP 白名单', '请求日志审计'],
    icon: IconShield,
    color: 'rose',
  },
  {
    key: '可视化监控',
    subKey: '全方位数据洞察',
    descKey: '实时用量统计、成本分析、响应时间追踪',
    highlights: ['按模型/渠道统计', '异常请求告警', '导出报表'],
    icon: IconBarChartHStroked,
    color: 'purple',
  },
  {
    key: '格式自动转换',
    subKey: '跨模型无缝对接',
    descKey: 'Claude/Gemini/DeepSeek ↔ GPT 无需适配代码',
    highlights: ['保持原生体验', '自动格式映射', '一次编写随处运行'],
    icon: IconLayers,
    color: 'cyan',
  },
];

const HOT_MODELS = [
  { name: 'GPT-4o', badge: '最快响应', badgeColor: 'cyan', price: '$5/1M', ctx: '128K' },
  { name: 'Claude 3.5', badge: '最强推理', badgeColor: 'indigo', price: '$3/1M', ctx: '200K' },
  { name: 'Gemini 2.0', badge: '多模态', badgeColor: 'teal', price: '$2/1M', ctx: '1M' },
  { name: 'DeepSeek V3', badge: '最省钱', badgeColor: 'amber', price: '$0.5/1M', ctx: '128K' },
  { name: 'Qwen 2.5', badge: '国产之光', badgeColor: 'violet', price: '$0.8/1M', ctx: '128K' },
  { name: 'Llama 3.1', badge: '开源免费', badgeColor: 'lime', price: '免费', ctx: '128K' },
  { name: 'Grok 2', badge: '实时搜索', badgeColor: 'cyan', price: '$2/1M', ctx: '128K' },
  { name: 'Mistral', badge: '欧洲合规', badgeColor: 'blue', price: '$1.5/1M', ctx: '128K' },
  { name: 'Cohere', badge: 'Rerank', badgeColor: 'orange', price: '$0.2/1M', ctx: '128K' },
];

const MODEL_CATEGORIES = [
  { key: '全部', count: 500 },
  { key: '对话', count: 120 },
  { key: '代码', count: 45 },
  { key: '图像', count: 30 },
  { key: '嵌入', count: 25 },
  { key: '音频', count: 20 },
];

const FORMAT_PAIRS = [
  { from: 'Claude', to: 'GPT', api: 'Messages API' },
  { from: 'Gemini', to: 'GPT', api: 'GenerateContent' },
  { from: 'DeepSeek', to: 'GPT', api: 'Chat API' },
];

const QUICK_START_STEPS = [
  { key: '注册账号', time: '30秒', desc: '支持多种登录方式', actionText: '立即注册', actionLink: '/register' },
  { key: '获取 API Key', time: '一键', desc: '立即获得免费额度', actionText: '获取密钥', actionLink: '/console' },
  { key: '替换 Base URL', time: '无需改代码', desc: '只改一个参数立即生效', actionText: '查看示例', actionLink: '#code-example' },
];

const CODE_EXAMPLES = {
  python: `import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://your-domain/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)`,
  nodejs: `import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: 'your-api-key',
    baseURL: 'https://your-domain/v1'
});

const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }]
});`,
  curl: `curl https://your-domain/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
};

const REAL_TIME_STATS = [
  { value: 12847, label: '日均请求', suffix: '', icon: '📊' },
  { value: 99.99, label: '服务在线率', suffix: '%', icon: '⚡' },
  { value: 89, label: '平均延迟', suffix: 'ms', icon: '🚀' },
  { value: 500, label: '模型接入', suffix: '+', icon: '🧠' },
];

const TESTIMONIALS = [
  { quote: 'Nexus AI 让我们的多模型切换变得无比简单，一行配置就能在 GPT、Claude 和开源模型之间切换。', author: '张工程师', role: 'AI 应用开发者', avatar: '👨‍💻' },
  { quote: 'API 响应速度的提升是肉眼可见的，边缘节点将首字延迟减少了 40%，这对我们的用户体验至关重要。', author: '李架构师', role: 'AI 平台架构师', avatar: '👩‍💼' },
  { quote: '稳定性是我们的底线，运行了半年在线率无可挑剔，自动故障转移机制让用户从未感知到任何异常。', author: '王总监', role: '技术负责人', avatar: '👨‍🔬' },
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const [selectedCodeLang, setSelectedCodeLang] = useState('python');
  const [selectedModelCategory, setSelectedModelCategory] = useState('全部');
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');
  const logo = getLogo();
  const systemName = getSystemName();
  const currentYear = new Date().getFullYear();

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const animateStats = () => {
      STATS_DATA.forEach((stat, index) => {
        setTimeout(() => {
          setAnimatedStats((prev) => ({ ...prev, [stat.key]: true }));
        }, index * 200);
      });
    };
    animateStats();
  }, []);

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  const getColorClasses = (color) => {
    const colors = {
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        icon: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
      },
      teal: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        icon: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
      },
      rose: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        icon: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
      },
      cyan: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        icon: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
      },
      violet: {
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        icon: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800',
      },
      lime: {
        bg: 'bg-lime-50 dark:bg-lime-900/20',
        icon: 'text-lime-600 dark:text-lime-400',
        border: 'border-lime-200 dark:border-lime-800',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
      },
    };
    return colors[color] || colors.indigo;
  };

  const getBadgeClasses = (badgeColor) => {
    const colors = {
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      lime: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[badgeColor] || colors.cyan;
  };

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          <section className='w-full border-b border-semi-color-border min-h-[600px] md:min-h-[700px] relative overflow-hidden particle-hero-container'>
            <div className='grid-lines-bg' />
            <ParticleBackground particleCount={35} />
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />
            <div className='blur-ball blur-ball-cyan' />
            <div className='flex items-center justify-center h-full px-4 py-16 md:py-20 lg:py-24 mt-10'>
              <div className='flex flex-col items-center justify-center text-center max-w-5xl mx-auto'>
                <div
                  className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10 w-full max-w-3xl ${isMobile ? 'px-2' : ''}`}
                >
                  {STATS_DATA.map((stat) => {
                    const IconComponent = stat.icon;
                    return (
                      <div
                        key={stat.key}
                        className={`stat-card-animated flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-500 ${animatedStats[stat.key] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      >
                        <IconComponent
                          size={isMobile ? 16 : 20}
                          className='text-indigo-500 dark:text-indigo-400'
                        />
                        <Text
                          className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                          {stat.value !== null ? (
                            <>
                              <AnimatedNumber target={stat.value} duration={1500} suffix={stat.key.includes('%') ? '%' : '+'} />
                              {!stat.key.includes('%') && !stat.key.includes('+') && <span> {t(stat.label)}</span>}
                            </>
                          ) : t(stat.key)}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <h1
                  className={`hero-title-gradient text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
                >
                  {t('一个 API Key，连接所有 AI 模型')}
                </h1>

                <p className='text-base md:text-lg lg:text-xl text-semi-color-text-1 mb-6 max-w-2xl'>
                  <Typewriter text={t('更好的价格，更好的稳定性，只需要将模型基址替换为：')} speed={40} delay={500} />
                </p>

                <div className='flex flex-col md:flex-row items-center justify-center gap-4 w-full mb-8 max-w-md'>
                  <Input
                    readonly
                    value={serverAddress}
                    className='flex-1 !rounded-full'
                    size={isMobile ? 'default' : 'large'}
                    suffix={
                      <div className='flex items-center gap-3'>
                        <div className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />
                        <ScrollList
                          bodyHeight={32}
                          style={{ border: 'unset', boxShadow: 'unset' }}
                        >
                          <ScrollItem
                            mode='wheel'
                            cycled={true}
                            list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)}
                          />
                        </ScrollList>
                        <Button
                          type='primary'
                          onClick={handleCopyBaseURL}
                          icon={<IconCopy />}
                          className='!rounded-full'
                        />
                      </div>
                    }
                  />
                </div>

                <div className='flex flex-row gap-4 justify-center items-center mb-10'>
                  <Link to='/console'>
                    <Button
                      theme='solid'
                      type='primary'
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-3xl px-8 py-2'
                      icon={<IconPlay />}
                    >
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  <Link to='/pricing'>
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='flex items-center !rounded-3xl px-6 py-2'
                      icon={<IconLayers />}
                    >
                      {t('模型广场')}
                    </Button>
                  </Link>
                </div>

                <div className='w-full'>
                  <div className='flex items-center mb-4 md:mb-6 justify-center'>
                    <Text
                      type='tertiary'
                      className='text-base md:text-lg font-light'
                    >
                      {t('支持众多的大模型供应商')}
                    </Text>
                  </div>
                  <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-4xl mx-auto px-4'>
{[
                       Moonshot,
                       OpenAI,
                       XAI,
                       Zhipu.Color,
                       Volcengine.Color,
                       Cohere.Color,
                       Claude.Color,
                       Gemini.Color,
                       Suno,
                       Minimax.Color,
                       Wenxin.Color,
                       Spark.Color,
                       Qingyan.Color,
                       DeepSeek.Color,
                       Qwen.Color,
                       Midjourney,
                       Grok,
                       AzureAI.Color,
                       Hunyuan.Color,
                       Xinference.Color,
                     ].map((ProviderIcon, idx) => (
                       <div
                         key={idx}
                         className='model-icon-animated w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center'
                       >
                         <ProviderIcon size={isMobile ? 28 : 36} />
                       </div>
                     ))}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center'>
                      <Text className='!text-lg sm:!text-xl md:!text-2xl font-bold text-semi-color-text-2'>
                        30+
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className='py-12 md:py-16 lg:py-20 px-4 bg-semi-color-bg-1'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-10'>
                <Title heading={2} className='text-semi-color-text-0 mb-3'>
                  {t('三步快速接入')}
                </Title>
                <Text type='tertiary' className='text-base md:text-lg'>
                  {t('只需 3 分钟，即可完成从注册到首次 API 调用')}
                </Text>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10'>
                {QUICK_START_STEPS.map((step, index) => (
                  <div key={step.key} className='relative'>
                    {index < 2 && !isMobile && (
                      <div className='absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-teal-400 z-10' />
                    )}
                    <TiltCard intensity={5} className='rounded-2xl'>
                      <Card
                        className='border border-gray-200/50 dark:border-gray-700/50 shadow-lg h-full bg-white/90 dark:bg-gray-800/70'
                        bodyStyle={{ padding: '24px' }}
                      >
                        <div className='flex flex-col items-center text-center'>
                          <div className='flex items-center gap-3 mb-4'>
                            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shadow-md'>
                              <Text className='font-bold text-white text-lg'>
                                {index + 1}
                              </Text>
                            </div>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'>
                              {step.time}
                            </span>
                          </div>
                          <Text className='font-semibold text-lg mb-2 text-semi-color-text-0'>
                            {t(step.key)}
                          </Text>
                          <Text type='tertiary' className='text-sm mb-4'>
                            {t(step.desc)}
                          </Text>
                          <Link to={step.actionLink}>
                            <Button
                              type='primary'
                              size='small'
                              icon={<IconArrowRight />}
                              iconPosition='right'
                              className='!rounded-full'
                            >
                              {t(step.actionText)}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </TiltCard>
                  </div>
                ))}
              </div>

              <div id='code-example' className='bg-gray-900 rounded-2xl p-6 shadow-xl'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <IconCode className='text-indigo-400' size={20} />
                    <Text className='text-white font-semibold'>{t('代码示例')}</Text>
                  </div>
                  <div className='flex gap-2'>
                    {['python', 'nodejs', 'curl'].map((lang) => (
                      <Button
                        key={lang}
                        size='small'
                        type={selectedCodeLang === lang ? 'primary' : 'tertiary'}
                        onClick={() => setSelectedCodeLang(lang)}
                        className='!rounded-lg text-xs'
                      >
                        {lang === 'nodejs' ? 'Node.js' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <pre className='bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm'>
                  <code className='text-green-400 font-mono whitespace-pre'>
                    {CODE_EXAMPLES[selectedCodeLang]}
                  </code>
                </pre>
                <div className='flex items-center justify-between mt-4'>
                  <Text type='tertiary' className='text-gray-400 text-xs'>
                    {t('复制代码即可开始使用')}
                  </Text>
                  <Button
                    size='small'
                    icon={<IconCopy />}
                    onClick={() => {
                      copy(CODE_EXAMPLES[selectedCodeLang]);
                      showSuccess(t('已复制到剪切板'));
                    }}
                    className='!rounded-lg'
                  >
                    {t('复制代码')}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className='py-12 md:py-16 lg:py-20 px-4 bg-semi-color-bg-0'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-10'>
                <Title heading={2} className='text-semi-color-text-0 mb-3'>
                  {t('六大核心能力')}
                </Title>
                <Text type='tertiary' className='text-base md:text-lg'>
                  {t('为企业提供全栈式 AI 接口解决方案')}
                </Text>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*]:h-full'>
                {FEATURES_DATA.map((feature) => {
                  const IconComponent = feature.icon;
                  const colorClasses = getColorClasses(feature.color);
                  return (
                    <div key={feature.key} className='h-full'>
                      <TiltCard intensity={6} className='rounded-2xl h-full'>
                        <Card
                          className={`feature-card-tech ${colorClasses.bg} ${colorClasses.border} border shadow-lg h-full`}
                          bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                          <div className='flex items-center gap-3 mb-4'>
                            <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} flex items-center justify-center shrink-0`}>
                              <IconComponent size={24} className={colorClasses.icon} />
                            </div>
                            <div>
                              <Text className='font-semibold text-lg text-semi-color-text-0'>
                                {t(feature.key)}
                              </Text>
                              <Text className='text-sm text-semi-color-text-2'>
                                {t(feature.subKey)}
                              </Text>
                            </div>
                          </div>
                          <Text type='tertiary' className='text-sm mb-4 leading-relaxed flex-grow'>
                            {t(feature.descKey)}
                          </Text>
                          <div className='flex flex-wrap gap-2 content-start'>
                            {feature.highlights.slice(0, 3).map((hl) => (
                              <span
                                key={hl}
                                className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-gray-900/30 text-semi-color-text-1 border border-gray-200/50 dark:border-gray-700/50 whitespace-nowrap'
                              >
                                <IconTickCircle className='text-green-500 mr-1' size={12} />
                                {t(hl)}
                              </span>
                            ))}
                          </div>
                        </Card>
                      </TiltCard>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className='relative bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-white overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
              <div className='absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl' />
              <div className='absolute -top-20 -right-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl' />
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl' />
            </div>

            <div className='relative max-w-6xl mx-auto px-6 py-12'>
              <div className='flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-white/10'>
                <div className='flex items-center gap-4'>
                  <img
                    src={logo}
                    alt={systemName}
                    className='w-10 h-10 rounded-full bg-white/10 p-1 object-contain'
                  />
                  <div>
                    <Typography.Title heading={5} className='!text-white !mb-0'>
                      {systemName}
                    </Typography.Title>
                    <Typography.Text className='!text-white/60 text-sm'>
                      {t('企业级大模型 API 聚合平台')}
                    </Typography.Text>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Link to='/register'>
                    <Button
                      type='primary'
                      theme='solid'
                      icon={<IconPlay />}
                      className='!rounded-full !bg-indigo-500 hover:!bg-indigo-600'
                    >
                      {t('立即开始')}
                    </Button>
                  </Link>
                  {docsLink && (
                    <Button
                      type='tertiary'
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                      className='!rounded-full !text-white/80 hover:!text-white !border-white/20 hover:!border-white/40'
                    >
                      {t('查看文档')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;