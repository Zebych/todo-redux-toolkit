import {
    addTodolistAC,
    removeTodolistAC,
    setTodolistsAC,
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
            const indexTL = state[action.payload.todolistId]
            const indexTask = indexTL.findIndex(tl => tl.id == action.payload.taskId)
            if (indexTask > -1) {//проверка нашлось ли совпадение
                indexTL.splice(indexTask, 1)
            }
        },
        addTaskAC(state, action: PayloadAction<TaskType>) {
            state[action.payload.todoListId].unshift(action.payload)
        },
        updateTaskAC(state, action: PayloadAction<{
            taskId: string, model: UpdateDomainTaskModelType, todolistId: string
        }>) {
            const indexTL = state[action.payload.todolistId]
            const indexTask = indexTL.findIndex(tl => tl.id == action.payload.taskId)
            if (indexTask > -1) {//проверка нашлось ли совпадение
                indexTL[indexTask] = {...indexTL[indexTask], ...action.payload.model}
            }
        },
        setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
            state[action.payload.todolistId] = action.payload.tasks
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        })
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        })
    }
})
//через объект:придется прокидывать типизацию экшенов, при изменении типизации
// АС в своем reducer здесь ошибку не покажет
/* extraReducers: {
     [addTodolistAC.type]: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
         state[action.payload.todolist.id] = []
     },
     [removeTodolistAC.type]: (state, action: PayloadAction<{ id: string }>) => {
         delete state[action.payload.id]
     },
     [setTodolistsAC.type]: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
         action.payload.todolists.forEach((tl: any) => {
             state[tl.id] = []
         })
     },
 }*/

export const tasksReducer = slice.reducer
// export actions
export const {removeTaskAC, addTaskAC, updateTaskAC, setTasksAC} = slice.actions


// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(() => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC(task)
                dispatch(action)
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

