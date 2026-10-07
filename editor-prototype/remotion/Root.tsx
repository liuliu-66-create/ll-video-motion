import React from 'react';
import {Composition} from 'remotion';
import {
  ConceptExplainerTopDown,
  type ConceptExplainerTopDownProps,
} from '../../src/templates/ConceptExplainerTopDown';
import {
  ConceptExplainerRadial,
  type ConceptExplainerRadialProps,
} from '../../src/templates/ConceptExplainerRadial';

export type EditableTopDownProps = ConceptExplainerTopDownProps & {
  durationSeconds: number;
};

const EditableTopDown: React.FC<EditableTopDownProps> = ({durationSeconds: _durationSeconds, ...props}) => (
  <ConceptExplainerTopDown {...props} />
);

export type EditableRadialProps = ConceptExplainerRadialProps & {
  durationSeconds: number;
};

const EditableRadial: React.FC<EditableRadialProps> = ({durationSeconds: _durationSeconds, ...props}) => (
  <ConceptExplainerRadial {...props} />
);

const defaultProps: EditableTopDownProps = {
  coreTitle: 'GitHub',
  definition: '全球开源代码和项目托管平台',
  leftPrefix: '超过',
  leftHighlight: '1.8亿',
  leftSuffix: '用户',
  middleText: '资源免费开放',
  rightText: '不会代码也能用',
  durationSeconds: 5,
};

const radialDefaultProps: EditableRadialProps = {
  coreTitle: '动效 Skill',
  coreSubtitle: '文字自动生成视频',
  leftLabel: '输入什么',
  leftText: '一段文字',
  rightLabel: '自动完成',
  rightPrefix: '',
  rightHighlight: '3步',
  rightSuffix: '',
  bottomLabel: '怎么修改',
  bottomLine1: '点击编辑',
  bottomLine2: '改完文字重新导出',
  durationSeconds: 5,
};

export const PrototypeRoot: React.FC = () => (
  <>
    <Composition
      id="ConceptExplainerTopDownEditable"
      component={EditableTopDown}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.round(Math.min(10, Math.max(4, props.durationSeconds)) * 30),
      })}
    />
    <Composition
      id="ConceptExplainerRadialEditable"
      component={EditableRadial}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={radialDefaultProps}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.round(Math.min(10, Math.max(4, props.durationSeconds)) * 30),
      })}
    />
  </>
);
