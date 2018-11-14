<?php

namespace App\Controller;

use App\Command\BusStop\ChangeBusStopGroupCommand;
use App\Command\BusStopGroup\CreateBusStopGroupCommand;
use App\Command\BusStopGroup\DeleteBusStopGroupCommand;
use App\Command\BusStopGroup\UpdateBusStopGroupCommand;
use App\Query\GetAllBusStopGroupsQuery;
use App\Query\GetBusStopGroupQuery;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;

final class BusStopGroupController
{
    /**
     * @Route("/getAllBusStopGroups", name="getAllBusStopGroups")
     */
    public function getAllBusStopGroups(Request $request, GetAllBusStopGroupsQuery $query): Response
    {
        $data = $query();
        return new JsonResponse($data);
    }

    /**
     * @Route("/getBusStopGroups", name="getBusStopGroups")
     */
    public function getBusStopGroups(Request $request, GetBusStopGroupQuery $query): Response
    {
        $data = [];
        foreach (json_decode($request->getContent(), true) as $id) {
            $data[] = $query(Uuid::fromString($id));
        }
        return new JsonResponse($data);
    }

    /**
     * @Route("/createBusStopGroups", name="createBusStopGroups")
     */
    public function createBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::uuid4();
            $commandBus->dispatch(new CreateBusStopGroupCommand($id, $data['name']));
            foreach ($data['busStops'] as $busStop) {
                $commandBus->dispatch(new ChangeBusStopGroupCommand(Uuid::fromString($busStop), $id));
            }
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/updateBusStopGroups", name="updateBusStopGroups")
     */
    public function updateBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $commandBus->dispatch(new UpdateBusStopGroupCommand($id, $data['name']));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }

    /**
     * @Route("/removeBusStopGroups", name="removeBusStopGroups")
     */
    public function removeBusStopGroups(Request $request, MessageBusInterface $commandBus): Response
    {
        $ids = [];
        foreach (json_decode($request->getContent(), true) as $data) {
            $id = Uuid::fromString($data['id']);
            $commandBus->dispatch(new DeleteBusStopGroupCommand($id));
            $ids[] = $id;
        }
        return new JsonResponse($ids);
    }
}