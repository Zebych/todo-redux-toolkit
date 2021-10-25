import {Dispatch} from 'redux'
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {ClearDataActionType, clearTodosDataAC} from "../TodolistsList/todolists-reducer";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";

const initialState = {
    isLoggedIn: false
}
export type InitialStateType = typeof initialState

export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}
// actions
export const setIsLoggedInAC = (value: boolean) =>
    ({type: 'login/SET-IS-LOGGED-IN', value} as const)

// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.login(data).then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC('succeeded'))
            dispatch(setIsLoggedInAC(true))
        } else {
            handleServerAppError( res.data,dispatch)
        }
    })
        .catch((err) => handleServerNetworkError( err.message,dispatch))
}

export const logoutTC = () => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.logout().then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC('succeeded'))
            dispatch(setIsLoggedInAC(false))
            dispatch(clearTodosDataAC())
        } else {
            handleServerAppError( res.data,dispatch)
        }
    })
        .catch((err) => handleServerNetworkError( err.message,dispatch))
}

// types
export type setIsLoggedInACType = ReturnType<typeof setIsLoggedInAC>
export type SetAppErrorACType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusACType = ReturnType<typeof setAppStatusAC>
type ActionsType = setIsLoggedInACType | SetAppStatusACType | SetAppErrorACType | ClearDataActionType