import React from 'react';
import {Composition} from 'remotion';
import {MultiPointTornList} from './templates/MultiPointTornList';
import {MultiPointStaggeredMemo} from './templates/MultiPointStaggeredMemo';
import {MultiPointStampLabel} from './templates/MultiPointStampLabel';
import {MultiPointIndexTabs} from './templates/MultiPointIndexTabs';
import {MultiPointBurstStickers} from './templates/MultiPointBurstStickers';
import {ProcessFlow} from './templates/ProcessFlow';
import {BeforeAfterCompare} from './templates/BeforeAfterCompare';
import {ConceptExplainerRadial} from './templates/ConceptExplainerRadial';
import {ConceptExplainerTopDown} from './templates/ConceptExplainerTopDown';
import {KeyConclusion} from './templates/KeyConclusion';
import {KeyConclusionEditorialCollage} from './templates/KeyConclusionEditorialCollage';
import {ScreenRecordingTransition} from './templates/ScreenRecordingTransition';
import {TimelineEvents} from './templates/TimelineEvents';
import {CostAccumulation} from './templates/CostAccumulation';
import {OpposingTrends} from './templates/OpposingTrends';
import {OrderHierarchy} from './templates/OrderHierarchy';
import {DualChoice} from './templates/DualChoice';
import {TransferDecay} from './templates/TransferDecay';
import {LayeredPyramid} from './templates/LayeredPyramid';
import {BigNumberCard} from './templates/BigNumberCard';
import {StageStatusBoard} from './templates/StageStatusBoard';
import {StageStatusClimb} from './templates/StageStatusClimb';
import {ImbalanceScale} from './templates/ImbalanceScale';
import {InputConvergence} from './templates/InputConvergence';
import {DynamicDataChart} from './templates/DynamicDataChart';
import {AudioAlignmentTimeline} from './templates/AudioAlignmentTimeline';
import {MaterialPhotoDesk} from './templates/MaterialPhotoDesk';
import {TypicalShotFilmstrip} from './templates/TypicalShotFilmstrip';
import {StoryboardWorkOrder} from './templates/StoryboardWorkOrder';
import {FinalQualityStampBoard} from './templates/FinalQualityStampBoard';
import {ActionPrerequisiteCard} from './templates/ActionPrerequisiteCard';
import {multiPoint03} from './presets';

export const Root: React.FC = () => (
  <>
    <Composition
      id="ActionPrerequisiteCard"
      component={ActionPrerequisiteCard}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '不是完全不能做',
        timingLabel: '动手之前',
        prompt: '先问自己',
        question: '这一步，真的解决核心问题吗？',
      }}
    />
    <Composition
      id="FinalQualityStampBoard"
      component={FinalQualityStampBoard}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '交付之前，最后检查这五项',
        items: [
          {label: '画面尺寸', value: '1920×1080'},
          {label: '声音', value: '正常'},
          {label: '时长', value: '168 秒'},
          {label: '黑帧', value: '无'},
          {label: '字幕', value: '单行'},
        ],
        conclusion: '全部通过',
      }}
    />
    <Composition
      id="StoryboardWorkOrder"
      component={StoryboardWorkOrder}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '每一个镜头，都整理成一张工作单',
        shotNumber: '03',
        timecode: '00:51.66 → 00:55.66',
        imageSrc: 'materials/material-screen-recording.png',
        subtitle: '每一句声音，都要对应到具体画面',
        visual: '展示真实操作录屏，突出关键步骤',
        materials: ['录屏', '截图', '品牌图'],
      }}
    />
    <Composition
      id="TypicalShotFilmstrip"
      component={TypicalShotFilmstrip}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '一条片子里，镜头不止一种',
        eyebrow: '代表性镜头',
        note: '插画、录屏和信息图，组合成完整叙事',
        shots: [
          {label: '插画镜头', imageSrc: 'materials/material-brand-visual.png', objectPosition: '49% 55%'},
          {label: '真实录屏', imageSrc: 'materials/material-screen-recording.png', objectPosition: '53% 50%'},
          {label: '信息图镜头', imageSrc: 'materials/material-infographic-shot.png', objectPosition: '50% 49%'},
        ],
      }}
    />
    <Composition
      id="MaterialPhotoDesk"
      component={MaterialPhotoDesk}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '做视频前，把真实素材先摊开',
        status: '四类素材',
        screenRecordingSrc: 'materials/material-screen-recording.png',
        screenRecordingLabel: '真实录屏',
        screenshotSrc: 'materials/material-operation-screenshot.png',
        screenshotLabel: '操作截图',
        brandVisualSrc: 'materials/material-brand-visual.png',
        brandVisualLabel: '品牌画面',
        audioLabel: '声音素材',
        audioFile: 'voiceover-final.wav',
        stampTop: '素材',
        stampBottom: '到齐',
      }}
    />
    <Composition
      id="AudioAlignmentTimeline"
      component={AudioAlignmentTimeline}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '一句声音，对应一个画面落点',
        emphasis: '以声音为准',
        clips: [
          {time: '00:00', line: '先把逐字稿定下来', shot: '画面：文稿确认'},
          {time: '00:03', line: '再按声音切分段落', shot: '画面：分镜切换'},
          {time: '00:07', line: '最后逐句匹配画面', shot: '画面：素材落位'},
        ],
      }}
    />
    <Composition
      id="DynamicDataChart"
      component={DynamicDataChart}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        variant: 'category-bars' as const,
        headline: '这四类内容，哪一种表现最好？',
        eyebrow: '近 30 天内容表现',
        unit: '%',
        items: [
          {label: '教程', value: 38},
          {label: '测评', value: 52},
          {label: '清单', value: 64},
          {label: '案例', value: 81},
        ],
        conclusion: '案例内容最高',
      }}
    />
    <Composition
      id="InputConvergence"
      component={InputConvergence}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '不同输入，如何汇成一个结果？',
        inputs: [
          {label: '文本输入', mark: '≡'},
          {label: '图片输入', mark: '▧'},
          {label: '语音输入', mark: '♩'},
          {label: '视频输入', mark: '▷'},
          {label: '表格数据', mark: '▦'},
          {label: '网页链接', mark: '↗'},
        ],
        outputLabel: '整合结果',
      }}
    />
    <Composition
      id="ImbalanceScale"
      component={ImbalanceScale}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '同样一件事，付出和回报真的对等吗？',
        leftLabel: '持续投入',
        leftValue: '80%',
        rightLabel: '实际回报',
        rightValue: '20%',
        conclusion: '付出和回报，根本不在一个量级',
      }}
    />
    <Composition
      id="StageStatusClimb"
      component={StageStatusClimb}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '这个视频，现在推进到哪一步了？',
        stages: [
          {title: '素材准备', status: 'done' as const},
          {title: '画面生成', status: 'done' as const},
          {title: '剪辑合成', status: 'active' as const},
          {title: '发布检查', status: 'pending' as const},
        ],
      }}
    />
    <Composition
      id="StageStatusBoard"
      component={StageStatusBoard}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '一个视频项目，现在推进到哪一步了？',
        context: '不是只看步骤顺序，而是同时看清哪些已经完成、哪一步正在进行、后面还剩什么。',
        stages: [
          {title: '素材准备', note: '逐字稿与录屏已整理', status: 'done' as const},
          {title: '画面生成', note: '静态效果已经确认', status: 'done' as const},
          {title: '剪辑合成', note: '正在对齐声音与画面', status: 'active' as const},
          {title: '发布检查', note: '等待最终成片', status: 'pending' as const},
        ],
        nextAction: '完成剪辑后，进入发布前检查',
      }}
    />
    <Composition
      id="BigNumberCard"
      component={BigNumberCard}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        headline: '同样的时间，产出效率提升了多少？',
        context: '连续记录一周，在工作时长不变的情况下，对比调整前后的平均日产出。',
        eyebrow: '连续 7 天实测记录',
        prefix: '',
        value: '3.5',
        suffix: '倍',
        label: '平均产出效率',
        beforeLabel: '调整前',
        beforeValue: '2 条',
        afterLabel: '调整后',
        afterValue: '7 条',
        footnote: '从每天 2 条，提升到每天 7 条',
      }}
    />
    <Composition
      id="LayeredPyramid"
      component={LayeredPyramid}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: '能力不是突然长出来的，而是一层层搭起来的',
        subtitle: '',
        levels: [
          {title: '稳定复用', note: '最终形成自己的方法'},
          {title: '完整项目', note: '把零散能力串起来'},
          {title: '单点练习', note: '先练熟一个具体动作'},
          {title: '基础认知', note: '理解原理、边界和标准'},
        ],
      }}
    />
    <Composition
      id="TransferDecay"
      component={TransferDecay}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: '预算每转一层，真正用于制作的就更少',
        subtitle: '',
        levels: [
          {title: '源头预算', value: '100%', note: '资源完整进入', resourceCount: 6},
          {title: '第一次转手', value: '70%', note: '先被截留一部分', resourceCount: 4},
          {title: '第二次转手', value: '40%', note: '继续被压缩', resourceCount: 2},
          {title: '真正制作端', value: '20%', note: '只剩最后一点', resourceCount: 1},
        ],
        lossLabels: ['被截留 30%', '又减少 30%', '最后只剩 20%'],
      }}
    />
    <Composition
      id="DualChoice"
      component={DualChoice}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: '你现在更需要哪一种？',
        leftEyebrow: '先把基础打稳',
        leftTitle: '继续学习',
        rightEyebrow: '先从实践开始',
        rightTitle: '马上动手',
        connector: '或',
        footer: '没有标准答案，按当前目标选择',
        footerMarker: '!',
        durationSeconds: 6,
      }}
    />
    <Composition id="OrderHierarchy" component={OrderHierarchy}
      durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{}} />
    <Composition id="OpposingTrends" component={OpposingTrends}
      durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{}} />
    <Composition id="CostAccumulation" component={CostAccumulation}
      durationInFrames={240} fps={30} width={1920} height={1080} defaultProps={{}} />
    <Composition
      id="MultiPointTorn03"
      component={MultiPointTornList}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={multiPoint03}
    />
    <Composition
      id="MultiPointStaggeredMemo"
      component={MultiPointStaggeredMemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        items: [
          {text: '确定选题', icon: 'magnifier' as const},
          {text: '准备逐字稿', icon: 'keyboard' as const},
          {text: '生成配音', icon: 'play' as const},
        ],
      }}
    />
    <Composition
      id="MultiPointStampLabel"
      component={MultiPointStampLabel}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        items: [
          {text: '确定选题'},
          {text: '准备逐字稿'},
          {text: '生成配音'},
        ],
      }}
    />
    <Composition
      id="MultiPointIndexTabs"
      component={MultiPointIndexTabs}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        items: [
          {text: '分析音频'},
          {text: '拆解分镜'},
          {text: '准备录屏'},
          {text: '生成成片'},
        ],
      }}
    />
    <Composition
      id="MultiPointBurstStickers"
      component={MultiPointBurstStickers}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        items: [
          {text: '选题'},
          {text: '文稿'},
          {text: '配音'},
          {text: '分镜'},
          {text: '成片'},
        ],
      }}
    />
    <Composition
      id="ProcessFlowZigzag"
      component={ProcessFlow}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{steps: ['第一步', '第二步', '第三步'], variant: 'zigzag'}}
    />
    <Composition
      id="ProcessFlowJourney"
      component={ProcessFlow}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{steps: ['第一步', '第二步', '第三步'], variant: 'journey'}}
    />
    <Composition
      id="BeforeAfterCompare"
      component={BeforeAfterCompare}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{beforeTitle: '改变前', beforeText: '内容示例', afterTitle: '改变后', afterText: '内容示例'}}
    />
    <Composition
      id="ConceptExplainerRadialGithub"
      component={ConceptExplainerRadial}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        coreTitle: 'GitHub',
        coreSubtitle: '全球开源项目平台',
        leftText: '不只是程序员',
        rightPrefix: '超过',
        rightHighlight: '1.8亿',
        rightSuffix: '用户',
        bottomLine1: '免费开放',
        bottomLine2: '不会代码也能用',
      }}
    />
    <Composition
      id="ConceptExplainerTopDownGithub"
      component={ConceptExplainerTopDown}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        coreTitle: 'GitHub',
        definition: '全球开源代码和项目托管平台',
        leftPrefix: '超过',
        leftHighlight: '1.8亿',
        leftSuffix: '用户',
        middleText: '资源免费开放',
        rightText: '不会代码也能用',
      }}
    />
    <Composition
      id="KeyConclusion"
      component={KeyConclusion}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        label: '重点结论',
        firstPart: '先有音频',
        secondPart: '再定时长',
      }}
    />
    <Composition
      id="KeyConclusionEditorialCollage"
      component={KeyConclusionEditorialCollage}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        label: '重点结论',
        firstPart: '先做出结果',
        secondPart: '再慢慢优化',
        note: '别等完美，边做边改更快。',
      }}
    />
    <Composition
      id="ScreenRecordingTransition"
      component={ScreenRecordingTransition}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: '来看实际操作',
        videoSrc: 'samples/0913-3.mp4',
        videoWidth: 1658,
        videoHeight: 1080,
        icon: 'cursor' as const,
      }}
    />
    <Composition
      id="TimelineEvents"
      component={TimelineEvents}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        events: [
          {time: '交片后', title: '开始催款', illustration: 'delivery' as const},
          {time: '年初', title: '反复沟通', illustration: 'calendar' as const},
          {time: '年中', title: '继续拖延', illustration: 'waiting' as const},
          {time: '6月', title: '彻底失联', illustration: 'disconnected' as const},
        ],
      }}
    />
  </>
);
