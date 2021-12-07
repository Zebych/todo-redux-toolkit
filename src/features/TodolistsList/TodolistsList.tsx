import React, {FC, ReactElement, useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {TodolistDomainType} from './todolists-reducer'
import {TasksStateType} from './tasks-reducer'
import {Grid} from '@material-ui/core'
import {
    AddItemForm,
    AddItemFormSubmitHelperType
} from '../../components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import {selectIsLoggedIn} from '../Auth/selectors'
import {todolistsActions} from './index'
import {AppRootStateType} from '../../utils/types'
import {useActions, useAppDispatch} from '../../utils/redux-utils'
import {useNavigate} from "react-router-dom";

type PropsType = {
    demo?: boolean
}

export const TodolistsList: FC<PropsType> = ({demo = false}): ReactElement => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const {fetchTodolistsTC, addTodolistTC} = useActions(todolistsActions)

    const addTodolistCallback = useCallback(async (title: string, helper: AddItemFormSubmitHelperType) => {
        let thunk = todolistsActions.addTodolistTC(title)
        const resultAction = await dispatch(thunk)

        if (todolistsActions.addTodolistTC.rejected.match(resultAction)) {
            if (resultAction.payload?.errors?.length) {
                const errorMessage = resultAction.payload?.errors[0]
                helper.setError(errorMessage)
            } else {
                helper.setError('Some error occured')
            }
        } else {
            helper.setTitle('')
        }
    }, [])


    useEffect(() => {
        if (demo || !isLoggedIn) {
            return
        }
        fetchTodolistsTC()
    }, [])


    if (!isLoggedIn) {
        navigate('/login')
    }

    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolistCallback}/>
        </Grid>
        <Grid container spacing={3} style={{flexWrap: 'nowrap', overflowX: 'scroll'}}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <div style={{width: '300px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                demo={demo}
                            />
                        </div>
                    </Grid>
                })
            }
        </Grid>
    </>
}
