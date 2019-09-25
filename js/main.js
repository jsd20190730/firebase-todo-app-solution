$(function () {
  const firebaseConfig = {
    apiKey: 'your_api_key',
    authDomain: 'your_project_id.firebaseapp.com',
    databaseURL: 'https://your_database_name.firebaseio.com',
    storageBucket: 'your_bucket_name.appspot.com'
  }

  firebase.initializeApp(firebaseConfig)

  const dbReferenceTasks = firebase.database().ref().child('tasks')

  // -------- **CREATE** ---------

  // listener that listens for a
  // submit event on the #addItem form
  $('#addItem').submit(function (event) {
    event.preventDefault()

    // Read the value from the input field and store it in a variable
    const newTaskName = $('#newTask').val()
    console.log(newTaskName)

    // clear out the input field
    $('#newTask').val('')

    // Firebase API - create task in firebase
    dbReferenceTasks.push({
      name: newTaskName,
      completed: false
    })
  })

  // -------- **READ** ---------

  // Firebase API - listen for changes to any
  // of the tasks in firebase
  dbReferenceTasks.on('child_added', function (snapshot) {
    console.log('child_changed called', snapshot.val().name)
    console.log(snapshot.val())
    console.log(snapshot.key)

    const taskId = snapshot.key
    const taskName = snapshot.val().name
    const isComplete = snapshot.val().completed

    const taskHtml = buildTaskHtml(taskName, isComplete)

    $('#taskList').append(`<li id="${taskId}">${taskHtml}</li>`)
  })

  // -------- **UPDATE** ---------

  // The listeners below are using jQuery's .on() method
  // and attaching event listeners to the <body>
  // which allows us to listen to events for
  // elements that are dynamically added
  // after the initial page load

  // Listener for change event on the checkboxes
  $('body').on('change', '#taskList li input[type="checkbox"]', function () {
    // toggle a 'done' class that applies a line-through style to a task
    $(this).parent().toggleClass('done')
    const taskId = $(this).parent().parent().attr('id')
    console.log(taskId)

    // Firebase API
    // If li now has'done' class, mark task in Firebase as "completed"
    // If li does not a 'done' class, mark task in Firebase as "incomplete" (or complette = false)

    if ($(this).parent().hasClass('done')) {
      dbReferenceTasks.child(taskId).update({ completed: true })
    } else {
      dbReferenceTasks.child(taskId).update({ completed: false })
    }
  })

  // listen for click event on the "edit" link
  // and display edit task form
  $('body').on('click', '#taskList a.editTask', function () {
    const taskName = $(this).parent().find('span.taskLabel').text()

    // display edit task form
    // with two buttons 'update' and 'cancel'
    const editTaskFormHtml = buildEditTaskFormHtml(taskName)
    $(this).parent().parent().html(editTaskFormHtml)
  })

  // Listen for click event 'save' button
  // to save changes made to the task
  $('body').on('click', '#saveUpdate', function () {
    // Stores the new task in a variable
    const updatedTaskName = $('#updateTask').val()
    const taskId = $(this).parent().attr('id')
    console.log('updated key', taskId)

    // Firebase API - update task in firebase
    dbReferenceTasks.child(taskId).update({ name: updatedTaskName })

    // Display new task name with checkbox
    const taskHtml = buildTaskHtml(updatedTaskName)
    $(this).parent().html(taskHtml)
  })

  // Listener that reverts back to the current
  // task name when user clicks 'cancel' button
  $('body').on('click', '#cancelUpdate', function () {
    // Stores the current task in a variable
    const taskName = $('#updateTask').val()

    // Redisplay current task name with checkbox
    const taskHtml = buildTaskHtml(taskName)
    $(this).parent().html(taskHtml)
  })

  // -------- **DELETE** ---------

  $('body').on('click', '#taskList a.deleteTask', function () {
    const removedTaskId = $(this).parent().parent().attr('id')

    // Firebase API - delete task in firebase
    dbReferenceTasks.child(removedTaskId).remove()
    $(this).parent().parent().remove()
  })

  // -------- Utility Functions ---------

  // html template for a task
  function buildTaskHtml (taskName, isComplete) {
    let checkedAttribute = isComplete ? "checked='checked'" : ''
    let doneClass = isComplete ? 'done' : ''
    return (
      `<label class='checkbox-inline ${doneClass}'>
        <input type='checkbox' ${checkedAttribute} name='items' />

        <span class="taskLabel"> ${taskName}</span>
        <a href="#" class='editTask'>edit</a>
        <a href="#" class='deleteTask'>delete</a>
      </label>`
    )
  }

  // html template for a edit task form
  function buildEditTaskFormHtml (taskName) {
    return (
      `<input class='form-control' type='text' id='updateTask' value="${taskName}">
      <button class='btn btn-primary' href='#' id='saveUpdate'>
        update
      </button>
      <button class='btn btn-default' href='#' id='cancelUpdate'>
        cancel
      </button>
      `
    )
  }
})
