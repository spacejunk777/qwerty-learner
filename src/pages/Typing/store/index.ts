import type { TypingState, UserInputLog } from './type'
import type { WordWithIndex } from '@/typings'
import type { LetterMistakes } from '@/utils/db/record'
import { mergeLetterMistake } from '@/utils/db/utils'
import shuffle from '@/utils/shuffle'
import { createContext } from 'react'
import { showTranslateConfigAtom} from '@/store'
import { useAtomValue, useSetAtom } from 'jotai'

export const initialState: TypingState = {
  chapterData: {
    words: [],
    index: 0,
    wordCount: 0,
    correctCount: 0,
    wrongCount: 0,
    wordRecordIds: [],
    userInputLogs: [],
  },
  blockData: {
    index: 0,
    status: 0,
    reverseIndex: 0,
    blocksize: 8,
    words: [],
    testscore: 0,
    timeoutid: null,
  },
  timerData: {
    time: 0,
    accuracy: 0,
    wpm: 0,
  },
  isTyping: false,
  isFinished: false,
  isShowSkip: false,
  isTransVisible: true,
  isLoopSingleWord: false,
  isSavingRecord: false,
}

export const initialUserInputLog: UserInputLog = {
  index: 0,
  correctCount: 0,
  wrongCount: 0,
  LetterMistakes: {},
}

export enum TypingStateActionType {
  SETUP_CHAPTER = 'SETUP_CHAPTER',
  SET_IS_SKIP = 'SET_IS_SKIP',
  SET_IS_TYPING = 'SET_IS_TYPING',
  TOGGLE_IS_TYPING = 'TOGGLE_IS_TYPING',
  REPORT_WRONG_WORD = 'REPORT_WRONG_WORD',
  REPORT_CORRECT_WORD = 'REPORT_CORRECT_WORD',
  NEXT_WORD = 'NEXT_WORD',
  LOOP_CURRENT_WORD = 'LOOP_CURRENT_WORD',
  FINISH_CHAPTER = 'FINISH_CHAPTER',
  INCREASE_WRONG_WORD = 'INCREASE_WRONG_WORD',
  SKIP_WORD = 'SKIP_WORD',
  SKIP_2_WORD_INDEX = 'SKIP_2_WORD_INDEX',
  REPEAT_CHAPTER = 'REPEAT_CHAPTER',
  NEXT_CHAPTER = 'NEXT_CHAPTER',
  TOGGLE_WORD_VISIBLE = 'TOGGLE_WORD_VISIBLE',
  TOGGLE_TRANS_VISIBLE = 'TOGGLE_TRANS_VISIBLE',
  TICK_TIMER = 'TICK_TIMER',
  ADD_WORD_RECORD_ID = 'ADD_WORD_RECORD_ID',
  SET_IS_SAVING_RECORD = 'SET_IS_SAVING_RECORD',
  SET_IS_LOOP_SINGLE_WORD = 'SET_IS_LOOP_SINGLE_WORD',
  TOGGLE_IS_LOOP_SINGLE_WORD = 'TOGGLE_IS_LOOP_SINGLE_WORD',
  END_THIS_BLOCK = 'END_THIS_BLOCK',
  START_CHAPTER_TEST = 'START_CHAPTER_TEST',
  RECORD_TEST_RESULT = 'RECORD_TEST_RESULT',
  SET_TIMEOUT_ID = 'SET_TIMEOUT_ID',
}

export type TypingStateAction =
  | { type: TypingStateActionType.SETUP_CHAPTER; payload: { words: WordWithIndex[]; shouldShuffle: boolean } }
  | { type: TypingStateActionType.SET_IS_SKIP; payload: boolean }
  | { type: TypingStateActionType.SET_IS_TYPING; payload: boolean }
  | { type: TypingStateActionType.TOGGLE_IS_TYPING }
  | { type: TypingStateActionType.REPORT_WRONG_WORD; payload: { letterMistake: LetterMistakes } }
  | { type: TypingStateActionType.REPORT_CORRECT_WORD }
  | { type: TypingStateActionType.NEXT_WORD }
  | { type: TypingStateActionType.LOOP_CURRENT_WORD }
  | { type: TypingStateActionType.FINISH_CHAPTER }
  | { type: TypingStateActionType.SKIP_WORD }
  | { type: TypingStateActionType.SKIP_2_WORD_INDEX; newIndex: number }
  | { type: TypingStateActionType.REPEAT_CHAPTER; shouldShuffle: boolean }
  | { type: TypingStateActionType.NEXT_CHAPTER }
  | { type: TypingStateActionType.TOGGLE_TRANS_VISIBLE }
  | { type: TypingStateActionType.TICK_TIMER; addTime?: number }
  | { type: TypingStateActionType.ADD_WORD_RECORD_ID; payload: number }
  | { type: TypingStateActionType.SET_IS_SAVING_RECORD; payload: boolean }
  | { type: TypingStateActionType.SET_IS_LOOP_SINGLE_WORD; payload: boolean }
  | { type: TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD }
  | { type: TypingStateActionType.END_THIS_BLOCK }
  | { type: TypingStateActionType.START_CHAPTER_TEST }
  | { type: TypingStateActionType.RECORD_TEST_RESULT; payload: boolean }
  | { type: TypingStateActionType.SET_TIMEOUT_ID; payload: NodeJS.Timeout | null }

type Dispatch = (action: TypingStateAction) => void
// const showTranslateConfig = useAtomValue(showTranslateConfigAtom)

export const typingReducer = (state: TypingState, action: TypingStateAction) => {

  switch (action.type) {
    case TypingStateActionType.SETUP_CHAPTER:
      state.chapterData.words = action.payload.shouldShuffle ? shuffle(action.payload.words) : action.payload.words
      state.chapterData.userInputLogs = state.chapterData.words.map((_, index) => ({ ...structuredClone(initialUserInputLog), index }))
      break
    case TypingStateActionType.SET_IS_SKIP:
      state.isShowSkip = action.payload
      break
    case TypingStateActionType.SET_IS_TYPING:
      state.isTyping = action.payload
      break

    case TypingStateActionType.TOGGLE_IS_TYPING:
      state.isTyping = !state.isTyping
      break
    case TypingStateActionType.REPORT_CORRECT_WORD: {
      state.chapterData.correctCount += 1

      const wordLog = state.chapterData.userInputLogs[state.chapterData.index]
      wordLog.correctCount += 1
      break
    }
    case TypingStateActionType.REPORT_WRONG_WORD: {
      state.chapterData.wrongCount += 1

      const letterMistake = action.payload.letterMistake
      const wordLog = state.chapterData.userInputLogs[state.chapterData.index]
      wordLog.wrongCount += 1
      wordLog.LetterMistakes = mergeLetterMistake(wordLog.LetterMistakes, letterMistake)
      break
    }
    case TypingStateActionType.NEXT_WORD:
      console.log('next word', state.blockData.status, )
      if (state.chapterData.index == -1) {
        state.chapterData.index = 0
      }
      state.chapterData.index += 1
      if (state.blockData.status === 2) {
        state.blockData.index  = 0
      } else {
        state.blockData.index += 1
      }
      // console.log('state.blockData.index',state.blockData.index)
      state.chapterData.wordCount += 1
      state.isShowSkip = false
      break
    case TypingStateActionType.LOOP_CURRENT_WORD:
      state.isShowSkip = false
      state.chapterData.wordCount += 1
      break
    case TypingStateActionType.FINISH_CHAPTER:
      state.chapterData.wordCount += 1
      state.isTyping = false
      state.isFinished = true
      state.isShowSkip = false
      break
    case TypingStateActionType.SKIP_WORD: {
      console.log('skip word')
      const newIndex = state.chapterData.index + 1
      if (newIndex >= state.chapterData.words.length) {
        state.isTyping = false
        state.isFinished = true
      } else {
        state.chapterData.index = newIndex
      }
      state.isShowSkip = false
      break
    }
    case TypingStateActionType.SKIP_2_WORD_INDEX: {
      console.log('skip 2 word')
      if (state.blockData.timeoutid) {
        console.log('clear timeout')
        clearTimeout(state.blockData.timeoutid)
        state.blockData.timeoutid = null
      }
      // if (state.blockData.status === 2 || state.blockData.status === 1) {
      //   let showTranslateConfig = useAtomValue(showTranslateConfigAtom)
      //   showTranslateConfig.show = false
      // }
      const newIndex = action.newIndex
      if (newIndex >= state.chapterData.words.length) {
        state.isTyping = false
        state.isFinished = true
      }
      state.chapterData.index = newIndex
      break
    }
    case TypingStateActionType.REPEAT_CHAPTER: {
      const newState = structuredClone(initialState)
      newState.chapterData.userInputLogs = state.chapterData.words.map((_, index) => ({ ...structuredClone(initialUserInputLog), index }))
      newState.isTyping = true
      newState.chapterData.words = action.shouldShuffle ? shuffle(state.chapterData.words) : state.chapterData.words
      newState.isTransVisible = state.isTransVisible
      return newState
    }
    case TypingStateActionType.NEXT_CHAPTER: {
      const newState = structuredClone(initialState)
      newState.chapterData.userInputLogs = state.chapterData.words.map((_, index) => ({ ...structuredClone(initialUserInputLog), index }))
      newState.isTyping = true
      newState.isTransVisible = state.isTransVisible
      return newState
    }
    case TypingStateActionType.TOGGLE_TRANS_VISIBLE:
      state.isTransVisible = !state.isTransVisible
      break
    case TypingStateActionType.TICK_TIMER: {
      const increment = action.addTime === undefined ? 1 : action.addTime
      const newTime = state.timerData.time + increment
      const inputSum =
        state.chapterData.correctCount + state.chapterData.wrongCount === 0
          ? 1
          : state.chapterData.correctCount + state.chapterData.wrongCount

      state.timerData.time = newTime
      state.timerData.accuracy = Math.round((state.chapterData.correctCount / inputSum) * 100)
      state.timerData.wpm = Math.round((state.chapterData.wordCount / newTime) * 60)
      break
    }
    case TypingStateActionType.ADD_WORD_RECORD_ID: {
      state.chapterData.wordRecordIds.push(action.payload)
      break
    }
    case TypingStateActionType.SET_IS_SAVING_RECORD: {
      state.isSavingRecord = action.payload
      break
    }
    case TypingStateActionType.SET_IS_LOOP_SINGLE_WORD: {
      state.isLoopSingleWord = action.payload
      break
    }
    case TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD: {
      state.isLoopSingleWord = !state.isLoopSingleWord
      break
    }
    case TypingStateActionType.END_THIS_BLOCK: {
      // console.log('reverseIndex',state.blockData.reverseIndex,state.chapterData.words.length - state.chapterData.index)
      console.log('end this block', state.blockData.status)
      if (state.blockData.status === 0) {
        state.chapterData.index = state.blockData.reverseIndex;
        console.log('get reverseIndex', state.blockData.reverseIndex)
        state.blockData.status = 1;
        state.blockData.index = 0

        // state.blockData.reverseIndex = state.
      } else {
        state.blockData.status = 0;
        state.blockData.reverseIndex = state.chapterData.index ;
        console.log('set reverseIndex', state.blockData.reverseIndex)
        if (state.chapterData.words.length - state.chapterData.index < 8) {
          state.blockData.blocksize = state.chapterData.words.length - state.chapterData.index;
        } else {
          state.blockData.blocksize = 8;
        }
        state.blockData.index = 0

      }
      // state.blockData.index = 0

      // console.log('end this block')
      break
    }
    case TypingStateActionType.START_CHAPTER_TEST: {
      console.log('start chapter test')
      state.blockData.status = 2;
      state.blockData.testscore = 0;
      state.chapterData.index = 0;
      state.blockData.index = 0;
      state.chapterData.words = shuffle(state.chapterData.words);
      state.blockData.timeoutid = null;

      break
    }

    case TypingStateActionType.RECORD_TEST_RESULT: {
      if (!action.payload) {
        state.blockData.testscore += 1;
      }
      // console.log('record test result', action.payload, state.blockData.testscore)
      break
    }
    case TypingStateActionType.SET_TIMEOUT_ID: {
      state.blockData.timeoutid = action.payload;
      console.log('set timeout id', state.blockData.timeoutid)
      break
    }
    default: {
      return state
    }
  }
}

export const TypingContext = createContext<{ state: TypingState; dispatch: Dispatch } | null>(null)
