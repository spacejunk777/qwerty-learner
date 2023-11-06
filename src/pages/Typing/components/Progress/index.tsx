import { TypingContext } from '../../store'
import { useContext, useEffect, useState } from 'react'

export default function Progress({ className }: { className?: string }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const [progress, setProgress] = useState(0)
  const [progressb, setProgressb] = useState(0)
  const [phase, setPhase] = useState(0)
  const [phaseb, setPhaseb] = useState(0)

  const colorSwitcher: { [key: number]: string } = {
    0: 'bg-indigo-200 dark:bg-indigo-300',
    1: 'bg-indigo-300 dark:bg-indigo-400',
    2: 'bg-indigo-400 dark:bg-indigo-500',
  }

  const colorSwitcherb: { [key: number]: string } = {
    0: 'bg-blue-200 dark:bg-blue-300',
    1: 'bg-blue-300 dark:bg-blue-400',
    2: 'bg-blue-400 dark:bg-blue-500',
  }

  const colorSwitcherb_s2: { [key: number]: string } = {
    0: 'bg-yellow-200 dark:bg-yellow-300',
    1: 'bg-yellow-300 dark:bg-yellow-400',
    2: 'bg-yellow-400 dark:bg-yellow-500',
  }

  useEffect(() => {
    const newProgress = Math.floor(
      ((state.chapterData.index - state.blockData.index * (1 - state.blockData.status)) / state.chapterData.words.length) * 100,
    )
    setProgress(newProgress)
    const colorPhase = Math.floor(newProgress / 33.4)
    setPhase(colorPhase)
  }, [state.chapterData.index, state.chapterData.words.length])

  useEffect(() => {
    // console.log('debug2',state.blockData.index , state.blockData.blocksize)
    const newProgress = Math.floor((state.blockData.index / state.blockData.blocksize) * 100)
    setProgressb(newProgress)
    const colorPhase = Math.floor(newProgress / 33.4)
    setPhaseb(colorPhase)
  }, [state.blockData.index])

  return (
    <div className={`relative w-1/4 pt-1 ${className}`}>
      <div className="mb-4 flex h-2 overflow-hidden rounded-xl bg-indigo-100 text-xs transition-all duration-300 dark:bg-indigo-200">
        <div
          style={{ width: `${progress}%` }}
          className={`flex flex-col justify-center whitespace-nowrap rounded-xl text-center text-white shadow-none transition-all duration-300 ${
            colorSwitcher[phase] ?? 'bg-indigo-200 dark:bg-indigo-300'
          }`}
        ></div>
      </div>
      <div className="mb-4 flex h-2 overflow-hidden rounded-xl bg-indigo-100 text-xs transition-all duration-300 dark:bg-indigo-200">
        <div
          style={{ width: `${(1 - state.blockData.status) * progressb}%` }}
          className={`flex flex-col justify-center whitespace-nowrap rounded-xl text-center text-white shadow-none transition-all duration-300 ${
            colorSwitcherb[phaseb] ?? 'bg-indigo-250 dark:bg-indigo-350'
          }`}
        ></div>
        <div
          style={{ width: `${state.blockData.status * progressb}%` }}
          className={`flex flex-col justify-center whitespace-nowrap rounded-xl text-center text-white shadow-none transition-all duration-300 ${
            colorSwitcherb_s2[phaseb] ?? 'bg-indigo-250 dark:bg-indigo-350'
          }`}
        ></div>
      </div>

      <div style={{ textAlign: 'center' }}>{state.blockData.status == 0 && '学习模式：按右键下一个'}</div>
      <div style={{ textAlign: 'center' }}>{state.blockData.status == 1 && '练习模式'}</div>
      <div style={{ textAlign: 'center' }}>{state.blockData.status == 2 && '测试模式: 按右键放弃'}</div>
    </div>
  )
}
