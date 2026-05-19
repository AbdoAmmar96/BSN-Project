<?php

use App\Models\ChatRoom;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Channels named "chat-room.{id}" — only users who are members of the room
| can subscribe.
|
*/

Broadcast::channel('chat-room.{roomId}', function (User $user, int $roomId) {
    $room = ChatRoom::find($roomId);
    if (!$room) return false;

    // Only actual room members get to subscribe — even admins can't snoop on
    // direct messages they aren't a participant of. For admin-relevant rooms
    // (support / project), the admin user is added as a member explicitly when
    // the room is created, so this still gives them access where intended.
    $isMember = $room->users()->where('users.id', $user->id)->exists();
    if (!$isMember) return false;

    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar_url,
    ];
});

// Presence channel for online status
Broadcast::channel('presence.users', function (User $user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar_url,
        'role' => $user->role,
    ];
});
