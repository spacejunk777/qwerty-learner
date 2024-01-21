import { TypingContext, TypingStateActionType } from '../../store'
import PrevAndNextWord from '../PrevAndNextWord'
import Progress from '../Progress'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import WordComponent from './components/Word'
import { usePrefetchPronunciationSound } from '@/hooks/usePronunciation'
import { isShowPrevAndNextWordAtom, loopWordConfigAtom, phoneticConfigAtom, wordDictationConfigAtom, showTranslateConfigAtom} from '@/store'
import type { Word } from '@/typings'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import React, { useEffect } from 'react';
import { stat } from 'fs'
import shuffle from '@/utils/shuffle'
import { on } from 'events'


export default function WordPanel() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isShowPrevAndNextWord = useAtomValue(isShowPrevAndNextWordAtom)
  const [wordComponentKey, setWordComponentKey] = useState(0)
  const [currentWordExerciseCount, setCurrentWordExerciseCount] = useState(0)
  const { times: loopWordTimes } = useAtomValue(loopWordConfigAtom)
  const currentWord = state.chapterData.words[state.chapterData.index]
  const nextWord = state.chapterData.words[state.chapterData.index + 1] as Word | undefined
  const setWordDictationConfig = useSetAtom(wordDictationConfigAtom)
  const showTranslateConfig = useAtomValue(showTranslateConfigAtom)

  const prevIndex = useMemo(() => {
    const newIndex = state.chapterData.index - 1
    return newIndex < 0 ? 0 : newIndex
  }, [state.chapterData.index])
  const nextIndex = useMemo(() => {
    const newIndex = state.chapterData.index + 1
    return newIndex > state.chapterData.words.length - 1 ? state.chapterData.words.length - 1 : newIndex
  }, [state.chapterData.index, state.chapterData.words.length])

  usePrefetchPronunciationSound(nextWord?.name)

  const reloadCurrentWordComponent = useCallback(() => {
    setWordComponentKey((old) => old + 1)
  }, [])

  const onFinish = useCallback(() => {
    console.log('debug finish',state.chapterData.index , state.chapterData.words.length)
    let translate_text = document.getElementById('translate_text');
    if (state.chapterData.index < state.chapterData.words.length - 1 || currentWordExerciseCount < loopWordTimes - 1 
      || state.blockData.status == 0) { // not done this chapter yet
      // 用户完成当前单词
      console.log(state.chapterData.index, state.blockData.status, state.blockData.index)
      
      if (currentWordExerciseCount < loopWordTimes - 1) {
        console.log('debug loop')
        setCurrentWordExerciseCount((old) => old + 1)
        dispatch({ type: TypingStateActionType.LOOP_CURRENT_WORD })
        reloadCurrentWordComponent()
      } else { // done this word
        console.log('debug else')
        setCurrentWordExerciseCount(0)
        // console.log(state.blockData.index,state.blockData.blocksize);
        if (state.blockData.status == 0 && state.chapterData.index < state.chapterData.words.length - 1) {
          showTranslateConfig.show = true;
        } else {
            // console.log('point 1')
            showTranslateConfig.show = false;
          
        }

        if (state.chapterData.index < state.chapterData.words.length - 1) { // 

            if ((state.blockData.status == 1 || state.blockData.status == 2) 
              && state.chapterData.index < state.chapterData.words.length - 1) {
              // console.log('debug show translate')
              // showTranslateConfig.show = true;
              let timeoutid;
              timeoutid = setTimeout(function() {
                  timeoutid = null;
                  dispatch({ type: TypingStateActionType.SET_TIMEOUT_ID, payload: timeoutid })

                  showTranslateConfig.show = true;
                  console.log('s1')
                  timeoutid = setTimeout(function() {
                    timeoutid = null;
                    dispatch({ type: TypingStateActionType.SET_TIMEOUT_ID, payload: timeoutid })
                    // console.log('point 2')
                    console.log('s2')

                    showTranslateConfig.show = false;
                    if (state.blockData.status == 1 && state.blockData.index == 7 && state.chapterData.index < state.chapterData.words.length - 1) {
                      // console.log('point 2 1')
                      showTranslateConfig.show = true;
                    }
                    // console.log('point 3')
                    console.log('s3')
         

                    dispatch({ type: TypingStateActionType.NEXT_WORD })

                    

                  }, 1600);   
                  dispatch({ type: TypingStateActionType.SET_TIMEOUT_ID, payload: timeoutid })
              }, 1000);
              dispatch({ type: TypingStateActionType.SET_TIMEOUT_ID, payload: timeoutid })      
              console.log('s4')     
            } else {
              console.log('p2')
              dispatch({ type: TypingStateActionType.NEXT_WORD })
              // console.log('debug bad status')
            }

        } else {
          console.log('p3')
          dispatch({ type: TypingStateActionType.NEXT_WORD })
        }
        // dispatch({ type: TypingStateActionType.NEXT_WORD })
        console.log('end p')
        if (state.blockData.status < 2 && (state.blockData.index == 7 || 
              (state.chapterData.index == state.chapterData.words.length - 1))) { // done this block
          // console.log(state.blockData.index,state.blockData.blocksize);
          if (state.blockData.status == 0) { // show word
            setWordDictationConfig((old) => ({ ...old, isOpen: true, openBy: 'auto' }))
            showTranslateConfig.show = false;
          } else if (state.blockData.status == 1) { // dont show word
            setWordDictationConfig((old) => ({ ...old, isOpen: false, openBy: 'auto' }))
            showTranslateConfig.show = true;
          }
          dispatch({ type: TypingStateActionType.END_THIS_BLOCK })
        }
      }
    } else {
      // 用户完成当前章节
      // console.log('debug else',state.chapterData.index , state.chapterData.words.length)
      // if (state.blockData.status == 0 || state.blockData.status == 1) {
      //   showTranslateConfig.show = false;
      // } else {
        showTranslateConfig.show = true;
      console.log('debug finish chapter')
      // }
      if (state.blockData.status < 2) {
        alert('即将开始单词测试')
        showTranslateConfig.show = false;
        dispatch({ type: TypingStateActionType.START_CHAPTER_TEST })
      } else {



        setTimeout(function() {
          showTranslateConfig.show = true;
          console.log('s1')
          setTimeout(function() {
            // console.log('point 2')
            console.log('end of test')

              let endchapter = true;
              if ( state.blockData.testscore / state.chapterData.words.length < 0.9 ) {
                const result = window.confirm('正确率（'+state.blockData.testscore / state.chapterData.words.length+'）不足 是否重新开始?');
                if (result) {
                  dispatch({ type: TypingStateActionType.START_CHAPTER_TEST })
                  endchapter = false;
                  
                } 
              };
              if (endchapter) {
                // console.log('debug finish chapter')
                setWordDictationConfig((old) => ({ ...old, isOpen: false, openBy: 'auto' }))
                dispatch({ type: TypingStateActionType.FINISH_CHAPTER })
                
              }


            }, 1600);   
        }, 1000);   



      }
    }
  }, [
    state.chapterData.index,
    state.chapterData.words.length,
    currentWordExerciseCount,
    loopWordTimes,
    dispatch,
    reloadCurrentWordComponent,
  ])

  const onSkipWord = useCallback(
    (type: 'prev' | 'next') => {
      console.log('debug skip word call back')
      if (type === 'prev') {
        dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex: prevIndex })
      }

      if (type === 'next') {
        dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex: nextIndex })
      }
    },
    [dispatch, prevIndex, nextIndex],
  )

  useHotkeys(
    'Ctrl + Shift + ArrowLeft',
    (e) => {
      e.preventDefault()
      onSkipWord('prev')
    },
    { preventDefault: true },
  )

  useHotkeys(
    'Ctrl + Shift + ArrowRight',
    (e) => {
      e.preventDefault()
      onSkipWord('next')
    },
    { preventDefault: true },
  )

  useHotkeys(
    'ArrowRight',
    (e) => {
      // if (state.blockData.status == 0 || state.blockData.status == 2) {
        e.preventDefault()
        // console.log('debug right key',state.blockData.index , state.blockData.blocksize)
        // if (state.blockData.status == 0) {
        //   setWordDictationConfig((old) => ({ ...old, isOpen: false, openBy: 'auto' }))
        // }
        onFinish()
      // }
    },
    { preventDefault: true },
  )


  const beginTest = useCallback(() => {
          alert('即将开始单词测试')
          showTranslateConfig.show = false;
          dispatch({ type: TypingStateActionType.START_CHAPTER_TEST })
          setWordDictationConfig((old) => ({ ...old, isOpen: true, openBy: 'auto' }))
  }, [
    state.chapterData.index,
    state.chapterData.words.length,
    currentWordExerciseCount,
    loopWordTimes,
    dispatch,
    reloadCurrentWordComponent,
  ])

  return (
    <div className="container flex h-full w-full flex-col items-center justify-center">
      <div className="container flex h-24 w-full shrink-0 grow-0 justify-between px-12 pt-10">
        {isShowPrevAndNextWord && state.isTyping && (
          <>
            <PrevAndNextWord type="prev" />
            <PrevAndNextWord type="next" />
          </>
        )}
      </div>
      <div className="container flex flex-grow flex-col items-center justify-center">
        {currentWord && (
          <div className="relative flex w-full justify-center">
            {!state.isTyping && (
              <div className="absolute flex h-full w-full justify-center">
                <div className="z-10 flex w-full items-center backdrop-blur-sm">
                  <p className="w-full select-none text-center text-xl text-gray-600 dark:text-gray-50">
                    按任意键{state.timerData.time ? '继续' : '开始'}
                  </p>
                </div>
              </div>
            )}
            <div className="relative">
              <WordComponent word={currentWord} onFinish={onFinish} key={wordComponentKey} />
              {phoneticConfig.isOpen && <Phonetic word={currentWord} />}
              {state.isTransVisible && <Translation trans={currentWord.trans.join('；')} />}
            </div>
          </div>
        )}
      </div>
      <button className="my-btn-primary fixed bottom-50 right-80" onClick={beginTest}  >
          开始测试
        </button>
      <Progress className={`mb-10 mt-auto ${state.isTyping ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
